import React, { useState } from 'react';
import '..styles/NewChatModal.css';

export default function NewChatModal({ isOpen, onConfirm, onCancel }) {
  const [title, setTitle] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim()) {
      onConfirm(title);
      setTitle('');
    }
  };

  const handleCancel = () => {
    setTitle('');
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="new-chat-modal">
        <h2>Create New Chat</h2>
        <p>Give your chat a title (optional)</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="e.g., React Questions, Python Help..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            autoFocus
            maxLength="100"
          />
          
          <div className="modal-buttons">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="confirm-btn">
              Create Chat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
