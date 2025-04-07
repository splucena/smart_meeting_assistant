// src/pages/Results.js
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Tab, Tabs, Button } from 'react-bootstrap';

const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [key, setKey] = useState('summary');
  
  // Get data passed from the Home page
  const { 
    transcript = '',
    summary = '',
    actionItems = '',
    meetingNotes = ''
  } = location.state || {};
  
  // Use useEffect to handle redirection if data is missing
  useEffect(() => {
    if (!transcript && !summary) {
      navigate('/');
    }
  }, [navigate, transcript, summary]);
  
  // If no data is passed, render nothing while the redirect happens
  if (!transcript && !summary) {
    return null;
  }
  
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
    <div className="results-page">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Meeting Analysis Results</h2>
        <Button 
          variant="outline-primary"
          onClick={() => navigate('/')}
        >
          Analyze Another Meeting
        </Button>
      </div>
      
      <Tabs
        id="results-tabs"
        activeKey={key}
        onSelect={(k) => setKey(k)}
        className="mb-3"
      >
        <Tab eventKey="summary" title="Summary">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Card.Title>Meeting Summary</Card.Title>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => downloadText(summary, 'meeting-summary.txt')}
                >
                  Download
                </Button>
              </div>
              <Card.Text className="mt-3">
                {summary.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </Card.Text>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="action-items" title="Action Items">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Card.Title>Action Items</Card.Title>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => downloadText(actionItems, 'action-items.txt')}
                >
                  Download
                </Button>
              </div>
              <div className="mt-3"
                dangerouslySetInnerHTML={{ __html: actionItems.replace(/\n/g, '<br>') }}
              />
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="notes" title="Meeting Notes">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Card.Title>Complete Meeting Notes</Card.Title>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => downloadText(meetingNotes, 'meeting-notes.txt')}
                >
                  Download
                </Button>
              </div>
              <div className="mt-3"
                dangerouslySetInnerHTML={{ __html: meetingNotes.replace(/\n/g, '<br>') }}
              />
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="transcript" title="Full Transcript">
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between">
                <Card.Title>Transcript</Card.Title>
                <Button 
                  variant="outline-secondary" 
                  size="sm"
                  onClick={() => downloadText(transcript, 'transcript.txt')}
                >
                  Download
                </Button>
              </div>
              <Card.Text className="mt-3 transcript-text">
                {transcript}
              </Card.Text>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};

export default Results;