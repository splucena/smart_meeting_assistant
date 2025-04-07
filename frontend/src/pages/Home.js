// src/pages/Home.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const Home = () => {
  const [file, setFile] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

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
      
      const transcript = transcribeResponse.data.transcript;
      
      // Step 2: Analyze the transcript
      const analyzeResponse = await axios.post('http://localhost:5000/api/analyze', {
        transcript: transcript,
      });
      
      // Step 3: Navigate to results page with data
      navigate('/results', { 
        state: {
          transcript: transcript,
          summary: analyzeResponse.data.summary,
          actionItems: analyzeResponse.data.action_items,
          meetingNotes: analyzeResponse.data.meeting_notes,
        } 
      });
      
    } catch (err) {
      console.error('Error processing audio:', err);
      setError(err.response?.data?.error || 'Error processing audio file');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8">
        <Card>
          <Card.Header as="h5">Upload Meeting Recording</Card.Header>
          <Card.Body>
            <Card.Text>
              Upload your meeting audio file to transcribe and analyze it using AI.
              Supported formats: MP3, WAV, M4A.
            </Card.Text>
            
            {error && <Alert variant="danger">{error}</Alert>}
            
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Audio File</Form.Label>
                <Form.Control 
                  type="file" 
                  accept="audio/*"
                  onChange={handleFileChange}
                  disabled={isLoading}
                />
                <Form.Text className="text-muted">
                  Max file size: 25MB
                </Form.Text>
              </Form.Group>
              
              <Button 
                variant="primary" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                    />
                    <span className="ms-2">Processing...</span>
                  </>
                ) : (
                  'Analyze Meeting'
                )}
              </Button>
            </Form>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Home;