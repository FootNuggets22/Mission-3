import React, { useState } from 'react';
import './Interviewer.css';

export default function Interviewer() {

  const [jobTitle, setJobTitle] = useState('');
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [questionCount, setQuestionCount] = useState(0);
  const startInterview = async () => {
    if (!jobTitle.trim()) return; // Don't proceed if job title is empty

    try {
      // Send an initial request to the backend to start the interview
      const response = await fetch('http://localhost:4000/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobTitle,
          userMessage: '',     // First message is empty — just starts the flow
          history: []          // No history at this point
        })
      });

      const data = await response.json();

      // Start chat history with user initiating and AI replying with first question
      const opening = [
        { role: 'user', content: `I want to interview for a ${jobTitle} role.` },
        { role: 'assistant', content: data.reply || 'Tell me about yourself.' }
      ];

      // Update chat and question count
      setChatHistory(opening);
      setQuestionCount(1);
    } catch (err) {
      console.error('Error starting interview:', err);
    }
  };

  // Function to handle user response submission
  const submitResponse = async () => {
    if (!userInput.trim()) return; // Don't proceed if user input is empty

    // Append the user's answer to the chat history
    const updatedHistory = [...chatHistory, { role: 'user', content: userInput }];
    setChatHistory(updatedHistory);
    setUserInput(''); // Clear input box

    try {
      // Send updated conversation history and latest message to the backend
      const response = await fetch('http://localhost:4000/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: updatedHistory,
          jobTitle,
          userMessage: userInput
        })
      });

      const data = await response.json();

      // Append AI's new reply to the chat history
      setChatHistory([...updatedHistory, { role: 'assistant', content: data.reply }]);
      setQuestionCount((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching AI response:', error);
    }
  };

  return (
    <div className="interview-wrapper">
      <div className="interview-container">
        <h1 className="title">Mock Job Interview</h1>

        {/* Job title input + Start button */}
        <div className="input-row">
          <input
            type="text"
            placeholder="Enter job title"
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            className="job-input"
          />
          <button className="start-button" onClick={startInterview}>
            Start
          </button>
        </div>

        {/* Chat conversation history */}
        <div className="chat-box">
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <strong>{msg.role === 'assistant' ? 'Interviewer' : 'You'}:</strong> {msg.content}
            </div>
          ))}
        </div>

        {/* Response input + Submit button */}
        <div className="input-row">
          <input
            type="text"
            placeholder="Type your answer"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitResponse()}
            className="response-input"
          />
          <button className="submit-button" onClick={submitResponse}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
