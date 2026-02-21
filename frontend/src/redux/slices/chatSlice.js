import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  chats: [

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
      const { title, _id } = action.payload;
      // Use backend _id if available, otherwise generate a local numeric id
      const chatId = _id || (Math.max(...state.chats.map(c => c.id || 0), 0) + 1);
      
      const newChat = {
        id: chatId,
        _id: _id, // Store MongoDB ObjectId if available
        title: title || 'New Chat',
        messages: []
      };
      // Add new chat at the top of the list
      state.chats.unshift(newChat);
      // Don't automatically switch to new chat - user must manually select it
    },

    // Select an existing chat
    selectChat: (state, action) => {
      const chatId = action.payload;
      state.currentChatId = chatId;
      // Find chat by either id or _id
      const selectedChat = state.chats.find(chat => chat.id === chatId || chat._id === chatId);
      state.messages = selectedChat ? (selectedChat.messages || []) : [];
    },

    setChats: (state, action) => {
      state.chats = action.payload;
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

    // Load messages for a chat (for existing chats when selecting them)
    loadMessages: (state, action) => {
      const { messages } = action.payload;
      state.messages = messages;
    },

    // Set loading state
    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    // Reset entire auth state (on logout)
    resetAuthState: (state) => {
      state.chats = [];
      state.currentChatId = null;
      state.messages = [];
      state.loading = false;
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
  setChats,
  setLoading,
  loadMessages,
  resetAuthState
} = chatSlice.actions;

export default chatSlice.reducer;
