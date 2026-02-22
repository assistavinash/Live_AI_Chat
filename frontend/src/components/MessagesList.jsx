import React, { useEffect, useRef } from 'react';
import '../styles/MessagesList.css';

export default function MessagesList({ messages, loading, currentChatId }) {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  return (  
    <div className="messages-container">
      <div className="messages-content">
        {!currentChatId ? (
          // Show welcome screen only when no chat is selected
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <h2>Hi 👋</h2>
            <p>Ask anything, and I'll help</p>
          </div>
        ) : messages.length === 0 ? (
          // Show empty state for selected chat with no messages yet
          <div className="empty-state">
            <div className="empty-icon">✨</div>
            <h2>Start a conversation</h2>
            <p>Type a message to get started</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => {
              // Render system messages (limit, rate-limit, etc.)
              if (message.sender === 'system') {
                return (
                  <div 
                    key={index}
                    className={`message-wrapper message-system message-system-${message.type}`}
                  >
                    <div className={`message message-system message-system-${message.type}`}>
                      {message.title && (
                        <div className="system-message-title">
                          {message.type === 'limit' ? '⏱️' : message.type === 'rate-limit' ? '⚠️' : 'ℹ️'} {message.title}
                        </div>
                      )}
                      <div className="message-content">
                        {message.text}
                      </div>
                      {message.type === 'limit' && message.data?.formattedTime && (
                        <div className="system-message-time">
                          Reset time: {message.data.formattedTime}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Render normal messages
              return (
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
              );
            })}
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
