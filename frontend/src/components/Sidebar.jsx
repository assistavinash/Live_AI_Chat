import React, { useState } from 'react';
import './Sidebar.css';

export default function Sidebar({ onNewChat, onSelectChat, onDeleteChat, previous, onLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const [activeChatId, setActiveChatId] = useState(null);
  const [hoverChatId, setHoverChatId] = useState(null);

  const handleSelectChat = (chatId) => {
    setActiveChatId(chatId);
    onSelectChat(chatId);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    onNewChat();
  };

  const handleDeleteChat = (e, chatId) => {
    e.stopPropagation();
    onDeleteChat(chatId);
  };

  return (
    <>
      {/* Sidebar Toggle for Mobile */}
      <button 
        className="sidebar-toggle-mobile"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        ☰
      </button>

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">✨</div>
          </div>
        </div>

        {/* New Chat Button */}
        <button className="new-chat-btn" onClick={handleNewChat}>
          <span className="icon">+</span>
          <span>New chat</span>
        </button>

        {/* Your Chats Section */}
        <div className="chats-section">
          <h3 className="section-title">Your chats</h3>
          <div className="chat-list">
            {previous.map((chat) => (
              <div
                key={chat.id}
                className={`chat-item-wrapper ${activeChatId === chat.id ? 'active' : ''}`}
                onMouseEnter={() => setHoverChatId(chat.id)}
                onMouseLeave={() => setHoverChatId(null)}
              >
                <button
                  className={`chat-item ${activeChatId === chat.id ? 'active' : ''}`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <span className="chat-title">{chat.title}</span>
                </button>
                {hoverChatId === chat.id && (
                  <button
                    className="chat-delete-btn"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    title="Delete chat"
                    aria-label="Delete chat"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>


        {/* User Profile Section */}
        <div className="user-profile">
          <div className="profile-item">
            <div className="avatar">AK</div>
            <div className="profile-info">
              <p className="profile-name">Avinash Kumar</p>
              <p className="profile-plan">Plus</p>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for Mobile */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
