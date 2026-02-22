import React, { useRef, useEffect } from 'react';
import '../styles/chatInput.css';

export default function ChatInput({
  input,
  setInput,
  onSendMessage,
  onStopMessage,
  loading
}) {
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 200) + 'px';
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage(e);
    }
  };

  return (
    <div className="input-area">
      <div className="input-container">
        <form onSubmit={onSendMessage} className="input-form">
          <div className="input-wrapper">
            <button 
              type="button" 
              className="input-icon-btn"
              aria-label="Add attachment"
              disabled={loading}
            >
              <i className="fas fa-plus"></i>
            </button>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything"
              className="input-field"
              disabled={loading}
              rows="1"
            />
            
            <div className="input-actions">
              <button 
                type="button" 
                className="input-icon-btn"
                aria-label="Voice input"
                disabled={loading}
              >
                <i className="fas fa-microphone"></i>
              </button>
              
              {loading ? (
                <button 
                  type="button"
                  className="stop-btn"
                  onClick={onStopMessage}
                  aria-label="Stop message"
                  title="Stop AI response"
                >
                  <i className="fa-solid fa-square"></i>
                </button>
              ) : (
                <button 
                  type="submit"
                  className="send-btn"
                  disabled={!input.trim()}
                  aria-label="Send message"
                >
                  <i className="fas fa-arrow-up"></i>
                </button>
              )}
            </div>
          </div>
        </form>
        <p className="input-footer">Aurora can make mistakes. Check important info.</p>
      </div>
    </div>
  );
}
