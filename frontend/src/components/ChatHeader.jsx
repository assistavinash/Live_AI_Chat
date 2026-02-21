import React from 'react';
import './ChatHeader.css';

export default function ChatHeader() {
  return (
    <div className="chat-header">
      <div className="model-selector">
        ChatGPT 5.2 <span className="dropdown-arrow">▼</span>
      </div>
    </div>
  );
}
