import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import '../styles/Sidebar.css';

export default function Sidebar({ onNewChat, onSelectChat, onDeleteChat, previous, onLogout }) {
  const [isOpen, setIsOpen] = useState(true);
  const { currentChatId } = useSelector(state => state.chat);
  const [hoverChatId, setHoverChatId] = useState(null);
  const [userName, setUserName] = useState('User');
  const [userInitials, setUserInitials] = useState('U');

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        if (user.fullName) {
          const fullName = `${user.fullName.firstName} ${user.fullName.lastName}`;
          setUserName(fullName);
          const initials = `${user.fullName.firstName[0]}${user.fullName.lastName[0]}`.toUpperCase();
          setUserInitials(initials);
        } else if (user.email) {
          setUserName(user.email);
          setUserInitials(user.email[0].toUpperCase());
        }
      } catch (error) {
        setUserName('User');
        setUserInitials('U');
      }
    }
  }, []);

  const handleSelectChat = (chatId) => {
    onSelectChat(chatId);
  };

  const handleNewChat = () => {
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
                className={`chat-item-wrapper ${currentChatId === chat.id ? 'active' : ''}`}
                onMouseEnter={() => setHoverChatId(chat.id)}
                onMouseLeave={() => setHoverChatId(null)}
              >
                <button
                  className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
                  onClick={() => handleSelectChat(chat.id)}
                >
                  <span className="chat-title">{chat.title || '💬 New chat'}</span>
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
            <div className="avatar">{userInitials}</div>
            <div className="profile-info">
              <p className="profile-name">{userName}</p>
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
