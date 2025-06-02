import React, { useState } from 'react';
import './Interviewer.css';

// Define and export the Interviewer component
export default function Interviewer() {
  // State to store the user's entered job title (e.g., "Frontend Developer")
  const [jobTitle, setJobTitle] = useState('');

  // State to store what the user types into the input field before submitting
  const [userInput, setUserInput] = useState('');

  // State to store the full conversation history as an array of messages
  const [chatHistory, setChatHistory] = useState([]);

  // State to keep track of how many AI-generated questions have been asked
  const [questionCount, setQuestionCount] = useState(0);

  // Triggered when the user clicks the "Start" button
  const startInterview = () => {
    // Don't do anything if job title field is empty or just whitespace
    if (!jobTitle.trim()) return;

    // Set the opening conversation: user says they want to interview, AI responds
    const opening = [
      { role: 'user', content: `I want to interview for a ${jobTitle} role.` }, // Initial user message
      { role: 'assistant', content: 'Tell me about yourself.' } // First AI message
    ];

    // Update chat history with the opening messages
    setChatHistory(opening);

    // Set question count to 1 (since the AI has asked one question)
    setQuestionCount(1);
  };

  // Triggered when the user clicks "Submit" or presses Enter
  const submitResponse = async () => {
    // Ignore empty input submissions
    if (!userInput.trim()) return;

    // Add the user's message to the current chat history
    const updatedHistory = [...chatHistory, { role: 'user', content: userInput }];

    // Update chat history with new user message
    setChatHistory(updatedHistory);

    // Clear the input field
    setUserInput('');

    try {
      // Send the updated history to the backend API to get the AI's response
      const response = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, // Ensure JSON format
        body: JSON.stringify({
          history: updatedHistory, // Pass current chat so AI can follow the context
          job: jobTitle,// Include job title for relevance
          questionCount// Helps guide how far along the interview is
        })
      });

      // Parse the response returned from the backend
      const data = await response.json();

      // Add the AI's reply to the chat history
      setChatHistory([...updatedHistory, { role: 'assistant', content: data.reply }]);

      // Increment the number of questions asked
      setQuestionCount((prev) => prev + 1);
    } catch (error) {
      console.error('Error fetching AI response:', error);
    }
  };

  return (
    <div className="interview-wrapper">
      {/* Centered container for the interview app */}
      <div className="interview-container">

        {/* Title of the app */}
        <h1 className="title">Mock Job Interview</h1>

        {/* Top row: input field to enter job title and "Start" button */}
        <div className="input-row">
          <input
            type="text"
            placeholder="Enter job title"
            value={jobTitle}// Current value bound to jobTitle state
            onChange={(e) => setJobTitle(e.target.value)} // Update job title when user types
            className="job-input"
          />
          <button
            className="start-button"
            onClick={startInterview}// When clicked, begin the interview
          >
            Start
          </button>
        </div>

        {/* Chat history box that shows messages between user and AI */}
        <div className="chat-box">
          {/* Loop through each message in chatHistory and display it */}
          {chatHistory.map((msg, idx) => (
            <div key={idx} className={`chat-message ${msg.role}`}>
              <strong>{msg.role === 'assistant' ? 'Interviewer' : 'You'}:</strong> {msg.content}
            </div>
          ))}
        </div>

        {/* Bottom row: input field to type your answer and a Submit button */}
        <div className="input-row">
          <input
            type="text"
            placeholder="Type your answer"
            value={userInput} // Current value bound to userInput state
            onChange={(e) => setUserInput(e.target.value)} // Update input as user types
            onKeyDown={(e) => e.key === 'Enter' && submitResponse()} // Submit on Enter
            className="response-input"
          />
          <button
            className="submit-button"
            onClick={submitResponse}// When clicked, send the input to AI
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
