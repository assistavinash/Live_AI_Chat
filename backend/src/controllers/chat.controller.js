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

async function updateChatTitle(req, res) {
    try {
        const { chatId } = req.params;
        const { title } = req.body;
        const user = req.user;

        // Verify chat belongs to user
        const chat = await chatModel.findOne({ _id: chatId, user: user._id });
        
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }

        // Update the title and lastActivity
        chat.title = title;
        chat.lastActivity = new Date();
        await chat.save();

        res.status(200).json({ 
            message: 'Chat title updated successfully',
            chat: {
                _id: chat._id,
                title: chat.title,
                lastActivity: chat.lastActivity
            }
        });
    } catch (error) {
        console.error('Error updating chat title:', error);
        res.status(500).json({ message: 'Error updating chat title' });
    }
}

async function getEmptyChats(req, res) {
    try {
        const user = req.user;

        // Find all chats for this user sorted by creation date
        const chats = await chatModel.find({ user: user._id }).sort({ createdAt: -1 });

        // Find the first chat with no messages
        let emptyChat = null;
        for (const chat of chats) {
            const messageCount = await messageModel.countDocuments({ chat: chat._id });
            if (messageCount === 0) {
                emptyChat = {
                    _id: chat._id,
                    title: chat.title,
                    lastActivity: chat.lastActivity
                };
                break;
            }
        }

        res.status(200).json({ 
            message: 'Empty chats retrieved',
            emptyChat
        });
    } catch (error) {
        console.error('Error fetching empty chats:', error);
        res.status(500).json({ message: 'Error fetching empty chats' });
    }
}

module.exports = {
    createChat,
    getChats,
    getMessages,
    updateChatTitle,
    getEmptyChats
}