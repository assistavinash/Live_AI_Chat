import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createNewChat,
  selectChat,
  addMessage,
  clearCurrentChat,
  setChats,
  deleteChat,
  setLoading,
  loadMessages,
  resetAuthState,
  addSystemMessage,
  removeLastUserMessage,
  updateChatTitle
} from '../redux/slices/chatSlice';

import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessagesList from '../components/MessagesList';
import InputArea from '../components/InputArea';
import { axiosInstance } from '../utils/axiosConfig';
import { io } from 'socket.io-client';

import '../styles/global.css';
import '../styles/theme.css';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const dispatch = useDispatch();

  const [input, setInput] = useState('');

  const socketRef = useRef(null);

  const { messages, chats, currentChatId, loading } = useSelector(state => state.chat);

  /* ---------------- FETCH CHATS FROM BACKEND ---------------- */

  const fetchChats = async () => {
    try {
      const res = await axiosInstance.get('/api/chat');

      if (res.data?.chats) {
        const transformed = res.data.chats.map(chat => ({
          ...chat,
          id: chat._id,
          messages: []
        }));
        dispatch(setChats(transformed));
      }
    } catch (err) {
      console.error('Error fetching chats:', err);
    }
  };

  /* ---------------- SOCKET SETUP ---------------- */

  useEffect(() => {
    // Only create socket if it doesn't exist
    if (!socketRef.current) {

      socketRef.current = io('http://localhost:3000', {
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 5
      });

;
    }

    const socket = socketRef.current;

    // AI response listener
    socket.on('ai-response', (message) => {

      dispatch(addMessage({ text: message.content, sender: 'ai' }));
      dispatch(setLoading(false));
    });

    // Limit reached listener
    socket.on('limit-reached', (data) => {
      // Remove the last user message that triggered the limit
      dispatch(addSystemMessage({
        text: data.message,
        type: 'limit',
        title: data.title,
        data: {
          formattedTime: data.formattedTime,
          nextResetTime: data.nextResetTime
        }
      }));
      dispatch(setLoading(false));
    });

    // Rate limit listener (API busy)
    socket.on('rate-limit', (data) => {
      // Remove the last user message that was rolled back by the backend
      dispatch(removeLastUserMessage());
      
      dispatch(addSystemMessage({
        text: data.message,
        type: 'rate-limit',
        title: 'API Temporarily Busy',
        data: {}
      }));
      dispatch(setLoading(false));
    });

    // AI response failed listener (quota exceeded, service busy, etc)
    socket.on('ai-response-failed', (data) => {
      // Handle different error types
      const errorMessages = {
        'QUOTA_EXCEEDED': '🚫 Daily limit reached! Please try tomorrow ✨',
        'SERVICE_BUSY': '⏳ Aurora is currently busy, please try in a few seconds',
        'AI_RESPONSE_FAILED': data.message || '❌ Something went wrong, please try again'
      };
      
      dispatch(addSystemMessage({
        text: errorMessages[data.code] || data.message || 'Error occurred',
        type: 'error',
        title: 'Error',
        data: {}
      }));
      dispatch(setLoading(false));
    });

    // Cleanup: remove listener on unmount
    return () => {
      socket.off('ai-response');
      socket.off('limit-reached');
      socket.off('rate-limit');
      socket.off('ai-response-failed');
    };
  }, [dispatch]);

  // Cleanup socket on logout (handled in handleLogout)
  useEffect(() => {
    return () => {
      // Optional: disconnect on component unmount
      // socketRef.current?.disconnect();
    };
  }, []);

  /* ---------------- LOAD CHATS (ON LOGIN) ---------------- */

  useEffect(() => {
    fetchChats();
  }, []);

  /* ---------------- URL DRIVEN CHAT LOAD ---------------- */

  useEffect(() => {
    if (chatId && chatId !== currentChatId) {
      dispatch(selectChat(chatId));
    }
  }, [chatId, currentChatId, dispatch]);

  /* ---------------- LOAD MESSAGES ---------------- */

  useEffect(() => {
    if (!currentChatId) return;

    const fetchMessages = async () => {
      try {
        const res = await axiosInstance.get(
          `/api/chat/${currentChatId}/messages`
        );

        const formatted = res.data.messages.map(msg => ({
          text: msg.text,
          sender: msg.sender,
          id: msg.timestamp,
          timestamp: msg.timestamp
        }));

        dispatch(loadMessages({ messages: formatted }));
      } catch (err) {
        console.error('Error fetching messages:', err);
      }
    };

    fetchMessages();
  }, [currentChatId, dispatch]);

  /* ---------------- GENERATE TITLE FROM MESSAGE ---------------- */

  const generateTitleFromMessage = (message) => {
    // Take first 50 characters and capitalize first letter
    let title = message.trim().substring(0, 50);
    
    // Remove markdown and special characters
    title = title.replace(/[#*_`\[\]()]/g, '');
    
    // Capitalize first letter
    title = title.charAt(0).toUpperCase() + title.slice(1);
    
    // Add ellipsis if truncated
    if (message.length > 50) {
      title += '...';
    }
    
    return title;
  };

  /* ---------------- UPDATE CHAT TITLE IN BACKEND ---------------- */

  const updateChatTitleInBackend = async (chatId, title) => {
    try {
      const res = await axiosInstance.put(
        `/api/chat/${chatId}/title`,
        { title }
      );
      return res.data.chat;
    } catch (err) {
      console.error('Error updating chat title:', err);
      return null;
    }
  };

  /* ---------------- CHECK FOR EMPTY CHATS ---------------- */

  const getEmptyChat = async () => {
    try {
      const res = await axiosInstance.get('/api/chat/empty-chat');
      return res.data.emptyChat;
    } catch (err) {
      console.error('Error fetching empty chat:', err);
      return null;
    }
  };

  /* ---------------- CREATE AND SELECT CHAT (REUSABLE) ---------------- */

  const createAndSelectChat = async () => {
    try {
      // Check if an empty chat already exists
      const emptyChat = await getEmptyChat();
      
      if (emptyChat) {
        dispatch(selectChat(emptyChat._id));
        navigate(`/chat/${emptyChat._id}`);
        return emptyChat._id;
      }

      // No empty chat exists, create a new one without title
      const res = await axiosInstance.post(
        '/api/chat',
        { title: null }
      );

      const newChatId = res.data.chat._id;

      dispatch(createNewChat({
        _id: newChatId,
        id: newChatId,
        title: null,
        messages: []
      }));

      dispatch(selectChat(newChatId));
      navigate(`/chat/${newChatId}`);
      
      // Refresh chats list to ensure latest chat appears at top
      await fetchChats();
      
      return newChatId;
    } catch (err) {
      console.error('Error creating chat:', err);
      return null;
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) {
      console.warn('Cannot send empty message');
      return;
    }

    // If no chat is selected, create one automatically
    let activeChatId = currentChatId;
    if (!activeChatId) {
      activeChatId = await createAndSelectChat();
      
      if (!activeChatId) {
        console.error('Failed to create chat');
        alert('Failed to create chat. Please try again.');
        return;
      }
    }

    if (!socketRef.current) {
      console.error('Socket not connected');
      alert('Socket not connected. Please refresh the page.');
      return;
    }

    if (!socketRef.current.connected) {
      console.error('Socket is not connected to server');
      alert('Not connected to server. Please refresh.');
      return;
    }

    const messageContent = input.trim();
    const isFirstMessage = messages.length === 0;

    dispatch(addMessage({ text: messageContent, sender: 'user' }));

    // If this is the first message, generate and update chat title
    if (isFirstMessage) {
      const generatedTitle = generateTitleFromMessage(messageContent);
      
      // Update title in backend
      const updatedChat = await updateChatTitleInBackend(activeChatId, generatedTitle);
      
      if (updatedChat) {
        // Update Redux state with new title
        dispatch(updateChatTitle({ chatId: activeChatId, title: generatedTitle }));
        
        // Refresh chats list to show updated title in sidebar
        await fetchChats();
      }
    }

    socketRef.current.emit('ai-message', {
      chat: activeChatId,
      content: messageContent
    });

    dispatch(setLoading(true));
    setInput('');
  };

  /* ---------------- STOP MESSAGE ---------------- */

  const handleStopMessage = () => {

    dispatch(setLoading(false));
    // Optionally emit stop event to backend to cancel AI processing
    if (socketRef.current?.connected) {
      socketRef.current.emit('stop-ai-message', { chat: currentChatId });
    }
  };



  /* ---------------- SELECT CHAT ---------------- */

  const handleSelectChat = (id) => {
    dispatch(selectChat(id));
    navigate(`/chat/${id}`);
  };

  /* ---------------- DELETE CHAT ---------------- */

  const handleDeleteChat = (id) => {
    if (!window.confirm('Delete this chat?')) return;

    dispatch(deleteChat(id));

    if (currentChatId === id) {
      dispatch(clearCurrentChat());
      navigate('/');
    }
  };

  /* ---------------- LOGOUT ---------------- */

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/api/auth/logout', {});
    } catch (err) {
      console.error(err);
    }

    // Disconnect and clear socket reference
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    dispatch(resetAuthState());

    localStorage.clear();
    sessionStorage.clear();

    // No need to manually clear headers - axiosInstance interceptor handles cleanup

    navigate('/login', { replace: true });
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="home-container">
      <Sidebar
        onNewChat={() => createAndSelectChat()}
        onSelectChat={handleSelectChat}
        onDeleteChat={handleDeleteChat}
        previous={chats}
        onLogout={handleLogout}
      />

      <main className="chat-area">
        <ChatHeader />
        <MessagesList 
          messages={messages} 
          loading={loading} 
          currentChatId={currentChatId}
        />
        <InputArea
          input={input}
          setInput={setInput}
          onSendMessage={handleSendMessage}
          onStopMessage={handleStopMessage}
          loading={loading}
        />
      </main>
    </div>
  );
}