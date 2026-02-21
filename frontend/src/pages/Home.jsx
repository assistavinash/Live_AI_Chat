import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  createNewChat, 
  selectChat, 
  addMessage, 
  clearCurrentChat, 
  deleteChat,
  setLoading 
} from '../redux/slices/chatSlice';
import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessagesList from '../components/MessagesList';
import InputArea from '../components/InputArea';
import NewChatModal from '../components/NewChatModal';
import '../styles/global.css';
import '../styles/theme.css';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  // Get state from Redux
  const { messages, chats, currentChatId, loading } = useSelector(state => state.chat);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim()) return;

    // Add user message
    dispatch(addMessage({
      text: input,
      sender: 'user'
    }));

    const userMessage = input;
    setInput('');
    dispatch(setLoading(true));

    try {
      // TODO: Replace with actual API call to backend
      setTimeout(() => {
        dispatch(addMessage({
          text: `I received your message: "${userMessage}". This is a demo response.`,
          sender: 'ai'
        }));
        dispatch(setLoading(false));
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      dispatch(setLoading(false));
    }
  };

  const handleLogout = () => {
    console.log('User logged out');
    
    // Clear login data from localStorage
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('user');
    
    // Redirect to login
    navigate('/login');
  };

  const handleSelectChat = (chatId) => {
    console.log('Selected chat:', chatId);
    dispatch(selectChat(chatId));
  };

  const handleNewChat = () => {
    // Show modal to prompt for chat title
    setShowNewChatModal(true);
  };

  const handleDeleteChat = (chatId) => {
    const confirmed = window.confirm('Delete this chat? This action cannot be undone.');
    if (confirmed) {
      dispatch(deleteChat(chatId));
      // If the deleted chat was the current chat, clear it
      if (currentChatId === chatId) {
        setInput('');
      }
    }
  };

  const handleConfirmNewChat = (title) => {
    dispatch(createNewChat({ title }));
    setShowNewChatModal(false);
    setInput('');
  };

  const handleCancelNewChat = () => {
    setShowNewChatModal(false);
  };

  return (
    <div className="home-container">
      <NewChatModal 
        isOpen={showNewChatModal}
        onConfirm={handleConfirmNewChat}
        onCancel={handleCancelNewChat}
      />

      <Sidebar 
        onNewChat={handleNewChat}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        previous={chats}
        onLogout={handleLogout}
      />

      <main className="chat-area">
        <ChatHeader />
        <MessagesList messages={messages} loading={loading} />
        <InputArea 
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
          loading={loading}
        />
      </main>
    </div>
  );
}
