const chatModel = require('../models/chat.model');
const messageModel = require('../models/message.model');

async function createChat(req, res) {
    const { title } = req.body;
    const user = req.user;

    const chat = await chatModel.create({
        user: user._id,
        title
    });

    res.status(201).json({ message: 'Chat created successfully', chat:{
        _id: chat._id,
        title: chat.title,
        lastActivity: chat.lastActivity,
        user: chat.user
    } 
    });
}

async function getChats(req, res) {
    const user = req.user;
    const chats = await chatModel.find({ user: user._id }).sort({ createdAt: -1 });
    res.status(200).json({ 
        message: 'Chats retrieved successfully',
        chats: chats.map(chat => ({
            _id: chat._id,
            title: chat.title,
            lastActivity: chat.lastActivity,
            user: chat.user
        }))
    });
}

async function getMessages(req, res) {
    try {
        const { chatId } = req.params;
        const user = req.user;

        // Verify chat belongs to user
        const chat = await chatModel.findOne({ _id: chatId, user: user._id });
        
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Fetch all messages for this chat
        const messages = await messageModel
            .find({ chat: chatId })
            .sort({ createdAt: 1 })
            .select('content role createdAt')
            .lean();

        res.status(200).json({ 
            message: 'Messages retrieved successfully',
            messages: messages.map(msg => ({
                text: msg.content,
                sender: msg.role === 'user' ? 'user' : 'ai',
                timestamp: msg.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
}

module.exports = {
    createChat,
    getChats,
    getMessages
}