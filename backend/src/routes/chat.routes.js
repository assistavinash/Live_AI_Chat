const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const chatController = require('../controllers/chat.controller');


const router = express.Router();

router.post('/', authMiddleware.authUser, chatController.createChat)

router.get('/', authMiddleware.authUser, chatController.getChats)

router.get('/empty-chat', authMiddleware.authUser, chatController.getEmptyChats)

router.get('/:chatId/messages', authMiddleware.authUser, chatController.getMessages)

router.put('/:chatId/title', authMiddleware.authUser, chatController.updateChatTitle)

module.exports = router;
