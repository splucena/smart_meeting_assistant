// src/App.js
import React, { useState } from 'react';
import './App.css';
import axios from 'axios';

function App() {
  // State for file upload
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // State for results
  const [showResults, setShowResults] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState('');
  const [meetingNotes, setMeetingNotes] = useState('');
  const [activeTab, setActiveTab] = useState('summary');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setError('Please select an audio file');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Step 1: Transcribe the audio
      const transcribeResponse = await axios.post('http://localhost:5000/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      const transcriptText = transcribeResponse.data.transcript;
      setTranscript(transcriptText);
      
      // Step 2: Analyze the transcript
      const analyzeResponse = await axios.post('http://localhost:5000/api/analyze', {
        transcript: transcriptText,
      });
      
      // Step 3: Set the results state
      setSummary(analyzeResponse.data.summary);
      setActionItems(analyzeResponse.data.action_items);
      setMeetingNotes(analyzeResponse.data.meeting_notes);
      
      // Show results
      setShowResults(true);
      
    } catch (err) {
      console.error('Error processing audio:', err);
      setError(err.response?.data?.error || 'Error processing audio file');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setShowResults(false);
    setFile(null);
    setTranscript('');
    setSummary('');
    setActionItems('');
    setMeetingNotes('');
  };

  // Function to handle downloading text as a file
  const downloadText = (content, filename) => {
    const element = document.createElement('a');
    const file = new Blob([content], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-container">
          <h1 className="header-title">Smart Meeting Assistant</h1>
          <button className="header-link" onClick={resetForm}>Home</button>
        </div>
      </header>

      <main className="container">
        {!showResults ? (
          <div className="upload-container">
            <div className="card">
              <div className="card-header">
                <h2>Upload Meeting Recording</h2>
              </div>
              <div className="card-body">
                <p>
                  Upload your meeting audio file to transcribe and analyze it using AI.
                  Supported formats: MP3, WAV, M4A.
                </p>
                
                {error && <div className="error-alert">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="audioFile">Audio File</label>
                    <input 
                      type="file" 
                      id="audioFile"
                      accept="audio/*"
                      onChange={handleFileChange}
                      disabled={isLoading}
                      className="form-control"
                    />
                    <small className="form-text">
                      Max file size: 25MB
                    </small>
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="button primary-button"
                  >
                    {isLoading ? 'Processing...' : 'Analyze Meeting'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="results-container">
            <div className="results-header">
              <h2>Meeting Analysis Results</h2>
              <button 
                className="button outline-button"
                onClick={resetForm}
              >
                Analyze Another Meeting
              </button>
            </div>
            
            <div className="tabs">
              <div className="tabs-header">
                <button 
                  className={`tab-button ${activeTab === 'summary' ? 'active' : ''}`}
                  onClick={() => setActiveTab('summary')}
                >
                  Summary
                </button>
                <button 
                  className={`tab-button ${activeTab === 'action-items' ? 'active' : ''}`}
                  onClick={() => setActiveTab('action-items')}
                >
                  Action Items
                </button>
                <button 
                  className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
                  onClick={() => setActiveTab('notes')}
                >
                  Meeting Notes
                </button>
                <button 
                  className={`tab-button ${activeTab === 'transcript' ? 'active' : ''}`}
                  onClick={() => setActiveTab('transcript')}
                >
                  Full Transcript
                </button>
              </div>
              
              <div className="tab-content">
                {activeTab === 'summary' && (
                  <div className="card">
                    <div className="card-body">
                      <div className="card-header-flex">
                        <h3>Meeting Summary</h3>
                        <button 
                          className="button small-button"
                          onClick={() => downloadText(summary, 'meeting-summary.txt')}
                        >
                          Download
                        </button>
                      </div>
                      <div className="content-area">
                        {summary.split('\n').map((line, i) => (
                          <p key={i}>{line}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {activeTab === 'action-items' && (
                  <div className="card">
                    <div className="card-body">
                      <div className="card-header-flex">
                        <h3>Action Items</h3>
                        <button 
                          className="button small-button"
                          onClick={() => downloadText(actionItems, 'action-items.txt')}
                        >
                          Download
                        </button>
                      </div>
                      <div 
                        className="content-area"
                        dangerouslySetInnerHTML={{ __html: actionItems.replace(/\n/g, '<br>') }}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === 'notes' && (
                  <div className="card">
                    <div className="card-body">
                      <div className="card-header-flex">
                        <h3>Complete Meeting Notes</h3>
                        <button 
                          className="button small-button"
                          onClick={() => downloadText(meetingNotes, 'meeting-notes.txt')}
                        >
                          Download
                        </button>
                      </div>
                      <div 
                        className="content-area"
                        dangerouslySetInnerHTML={{ __html: meetingNotes.replace(/\n/g, '<br>') }}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === 'transcript' && (
                  <div className="card">
                    <div className="card-body">
                      <div className="card-header-flex">
                        <h3>Transcript</h3>
                        <button 
                          className="button small-button"
                          onClick={() => downloadText(transcript, 'transcript.txt')}
                        >
                          Download
                        </button>
                      </div>
                      <div className="content-area transcript-text">
                        {transcript}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;