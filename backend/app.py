# app.py
from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import requests
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Get OpenAI API key from environment
api_key = os.getenv("OPENAI_API_KEY")
if not api_key:
    raise ValueError("No OpenAI API key found in environment variables")

# OpenAI API endpoints
OPENAI_API_COMPLETIONS = "https://api.openai.com/v1/chat/completions"
OPENAI_API_TRANSCRIPTIONS = "https://api.openai.com/v1/audio/transcriptions"


@app.route("/api/transcribe", methods=["POST"])
def transcribe_audio():
    """Transcribe audio file using OpenAI Whisper API"""
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    audio_file = request.files["file"]

    try:
        # Create headers with API key
        headers = {"Authorization": f"Bearer {api_key}"}

        # Create form data with file and model
        files = {
            "file": (audio_file.filename, audio_file.read(), audio_file.content_type),
            "model": (None, "whisper-1"),
        }

        # Make direct API request to OpenAI
        response = requests.post(
            OPENAI_API_TRANSCRIPTIONS, headers=headers, files=files
        )

        if response.status_code == 200:
            return jsonify({"transcript": response.json()["text"]})
        else:
            return (
                jsonify({"error": f"OpenAI API error: {response.text}"}),
                response.status_code,
            )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/analyze", methods=["POST"])
def analyze_transcript():
    """Analyze transcript to generate summary, action items, and meeting notes"""
    data = request.json
    if not data or "transcript" not in data:
        return jsonify({"error": "No transcript provided"}), 400

    transcript = data["transcript"]

    try:
        # Create headers for API requests
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        # Generate summary
        summary_payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an AI assistant that summarizes meeting transcripts concisely.",
                },
                {
                    "role": "user",
                    "content": f"Summarize this meeting transcript in 3-5 sentences:\n\n{transcript}",
                },
            ],
        }

        summary_response = requests.post(
            OPENAI_API_COMPLETIONS, headers=headers, data=json.dumps(summary_payload)
        )

        if summary_response.status_code != 200:
            return (
                jsonify({"error": f"OpenAI API error: {summary_response.text}"}),
                summary_response.status_code,
            )

        summary = summary_response.json()["choices"][0]["message"]["content"]

        # Extract action items
        action_items_payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an AI assistant that extracts action items from meeting transcripts.",
                },
                {
                    "role": "user",
                    "content": f"Extract all action items from this meeting transcript. Format as a bulleted list with assignee and due date if mentioned:\n\n{transcript}",
                },
            ],
        }

        action_items_response = requests.post(
            OPENAI_API_COMPLETIONS,
            headers=headers,
            data=json.dumps(action_items_payload),
        )

        if action_items_response.status_code != 200:
            return (
                jsonify({"error": f"OpenAI API error: {action_items_response.text}"}),
                action_items_response.status_code,
            )

        action_items = action_items_response.json()["choices"][0]["message"]["content"]

        # Generate meeting notes
        notes_payload = {
            "model": "gpt-3.5-turbo",
            "messages": [
                {
                    "role": "system",
                    "content": "You are an AI assistant that creates structured meeting notes.",
                },
                {
                    "role": "user",
                    "content": f"Create professional meeting notes from this transcript. Include sections for Summary, Discussion Topics, Decisions Made, and Next Steps:\n\n{transcript}",
                },
            ],
        }

        notes_response = requests.post(
            OPENAI_API_COMPLETIONS, headers=headers, data=json.dumps(notes_payload)
        )

        if notes_response.status_code != 200:
            return (
                jsonify({"error": f"OpenAI API error: {notes_response.text}"}),
                notes_response.status_code,
            )

        meeting_notes = notes_response.json()["choices"][0]["message"]["content"]

        return jsonify(
            {
                "summary": summary,
                "action_items": action_items,
                "meeting_notes": meeting_notes,
            }
        )

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=5000)
