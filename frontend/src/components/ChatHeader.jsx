import React from 'react';
import '../styles/ChatHeader.css';

export default function ChatHeader() {
  return (
    <div className="chat-header">
      <div className="model-selector">
        Aurora <span className="dropdown-arrow">▼</span>
      </div>
    </div>
  );
}
