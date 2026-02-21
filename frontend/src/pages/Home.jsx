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
  resetAuthState
} from '../redux/slices/chatSlice';

import Sidebar from '../components/Sidebar';
import ChatHeader from '../components/ChatHeader';
import MessagesList from '../components/MessagesList';
import InputArea from '../components/InputArea';
import NewChatModal from '../components/NewChatModal';

import axios from 'axios';
import { io } from 'socket.io-client';
import { setupAxiosInterceptor } from '../utils/axiosConfig';

import '../styles/global.css';
import '../styles/theme.css';
import '../styles/Home.css';

export default function Home() {
  const navigate = useNavigate();
  const { chatId } = useParams();
  const dispatch = useDispatch();

  const [input, setInput] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);

  const socketRef = useRef(null);

  const { messages, chats, currentChatId, loading } = useSelector(state => state.chat);

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

    // Cleanup: remove listener on unmount
    return () => {
      socket.off('ai-response');
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
    const fetchChats = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/chat', {
          withCredentials: true
        });

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

    fetchChats();
  }, [dispatch]);

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
        const res = await axios.get(
          `http://localhost:3000/api/chat/${currentChatId}/messages`,
          { withCredentials: true }
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

  /* ---------------- SEND MESSAGE ---------------- */

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !currentChatId) {
      console.warn('Cannot send message:', { hasInput: !!input.trim(), hasChatId: !!currentChatId });
      return;
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


    dispatch(addMessage({ text: input, sender: 'user' }));

    socketRef.current.emit('ai-message', {
      chat: currentChatId,
      content: input.trim()
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

  /* ---------------- NEW CHAT ---------------- */

  const handleConfirmNewChat = async (title) => {
    try {
      const res = await axios.post(
        'http://localhost:3000/api/chat',
        { title },
        { withCredentials: true }
      );

      const newChatId = res.data.chat._id;

      dispatch(createNewChat({
        _id: newChatId,
        id: newChatId,
        title,
        messages: []
      }));

      dispatch(selectChat(newChatId));
      navigate(`/chat/${newChatId}`);

    } catch (err) {
      console.error('Error creating chat:', err);
    }

    setShowNewChatModal(false);
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
      await axios.post('http://localhost:3000/api/auth/logout', {}, {
        withCredentials: true
      });
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

    delete axios.defaults.headers.common["Authorization"];

    navigate('/login', { replace: true });
  };

  /* ---------------- AXIOS INTERCEPTOR ---------------- */

  useEffect(() => {
    setupAxiosInterceptor(navigate, dispatch);
  }, [navigate, dispatch]);

  /* ---------------- UI ---------------- */

  return (
    <div className="home-container">
      <NewChatModal
        isOpen={showNewChatModal}
        onConfirm={handleConfirmNewChat}
        onCancel={() => setShowNewChatModal(false)}
      />

      <Sidebar
        onNewChat={() => setShowNewChatModal(true)}
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