import React, { useEffect, useRef } from 'react';
import './MessagesList.css';

export default function MessagesList({ messages, loading }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (
    <div className="messages-container">
      <div className="messages-content">
        {messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <h2>Hi 👋</h2>
            <p>Ask anything, and I'll help</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div 
                key={index}
                className={`message-wrapper message-${message.sender}`}
              >
                <div className={`message message-${message.sender}`}>
                  <div className="message-content">
                    {message.text}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-wrapper message-ai">
                <div className="message message-ai">
                  <div className="message-content loading-indicator">
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                    <div className="loading-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
