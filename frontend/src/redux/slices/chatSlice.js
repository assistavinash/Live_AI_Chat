import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [
    { 
      id: 1, 
      title: 'Greetings and Small Talk',
      messages: []
    },
    { 
      id: 2, 
      title: 'React Register Component F...',
      messages: []
    },
    { 
      id: 3, 
      title: 'System instruction for Aurora',
      messages: []
    },
    { 
      id: 4, 
      title: 'Google GenAI Error Fix',
      messages: []
    }
  ],
  currentChatId: null,
  messages: [], // Current chat messages
  loading: false
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Create a new chat
    createNewChat: (state, action) => {
      const newChatId = Math.max(...state.chats.map(c => c.id || 0), 0) + 1;
      const newChat = {
        id: newChatId,
        title: action.payload.title || 'New Chat',
        messages: []
      };
      state.chats.unshift(newChat);
      state.currentChatId = newChatId;
      state.messages = [];
    },

    // Select an existing chat
    selectChat: (state, action) => {
      const chatId = action.payload;
      state.currentChatId = chatId;
      const selectedChat = state.chats.find(chat => chat.id === chatId);
      state.messages = selectedChat ? selectedChat.messages : [];
    },

    // Add message to current chat
    addMessage: (state, action) => {
      const { text, sender } = action.payload;
      const message = {
        id: Date.now(),
        text,
        sender,
        timestamp: new Date().toISOString()
      };

      state.messages.push(message);

      // Update the message in the chats array
      const currentChat = state.chats.find(chat => chat.id === state.currentChatId);
      if (currentChat) {
        currentChat.messages = state.messages;
      }
    },

    // Update chat title
    updateChatTitle: (state, action) => {
      const { chatId, title } = action.payload;
      const chat = state.chats.find(c => c.id === chatId);
      if (chat) {
        chat.title = title;
      }
    },

    // Delete a chat
    deleteChat: (state, action) => {
      const chatId = action.payload;
      state.chats = state.chats.filter(chat => chat.id !== chatId);
      if (state.currentChatId === chatId) {
        state.currentChatId = null;
        state.messages = [];
      }
    },

    // Clear current chat messages (without deleting the chat)
    clearCurrentChat: (state) => {
      if (state.currentChatId) {
        const currentChat = state.chats.find(chat => chat.id === state.currentChatId);
        if (currentChat) {
          currentChat.messages = [];
        }
      }
      state.messages = [];
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    }
  }
});

export const {
  createNewChat,
  selectChat,
  addMessage,
  updateChatTitle,
  deleteChat,
  clearCurrentChat,
  setLoading
} = chatSlice.actions;

export default chatSlice.reducer;
