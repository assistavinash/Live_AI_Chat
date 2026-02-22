const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");
const {
  checkAndResetDailyLimit,
  incrementMessageCount,
  getResetMessage
} = require("../utils/messageLimitUtils");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true
    }
  });

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      return next(new Error("Authentication error: No token provided"));
    }
    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);
      const user = await userModel.findById(decoded.id);
      socket.user = user;
      next();
    } catch (err) {
      return next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {

    socket.on("ai-message", async (messagePayLoad) => {
      let userMessageId = null;

      try {
        // Validate that chat ID is provided
        if (!messagePayLoad.chat) {
      socket.emit("error", { message: "Chat ID is required" });
      return;
    }

    const limitCheck = await checkAndResetDailyLimit(socket.user);
    if (limitCheck.isLimitReached) {
      const resetMessage = getResetMessage(limitCheck.timeUntilReset);
      socket.emit("limit-reached", resetMessage);
      return;
    }

    const message = await messageModel.create({
      chat: messagePayLoad.chat,
      user: socket.user._id,
      content: messagePayLoad.content,
      role: "user",
    });

    userMessageId = message._id;

    await incrementMessageCount(socket.user);

    const vectors = await aiService.generateVector(messagePayLoad.content);

    const [memory, chatHistory] = await Promise.all([
      queryMemory({ queryVector: vectors, limit: 3, metadata: { user: socket.user._id } }),
      messageModel.find({ chat: messagePayLoad.chat }).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    const response = await aiService.generateResponse(chatHistory);

    const responseMessage = await messageModel.create({
      chat: messagePayLoad.chat,
      user: socket.user._id,
      content: response,
      role: "model",
    });

    socket.emit("ai-response", {
      content: response,
      chat: messagePayLoad.chat,
    });

  } catch (error) {
    // ===== ERROR HANDLING SHOULD BE HERE =====

    console.error("AI Error:", error);

    // rollback user message if AI failed
    if (userMessageId) {
      await messageModel.findByIdAndDelete(userMessageId);
      await userModel.findByIdAndUpdate(socket.user._id, {
        $inc: { dailyMessageCount: -1 }
      });
    }

    // friendly message (NO DB SAVE)
    socket.emit("ai-error", {
      message: "I’m a little busy right now. Please try again shortly so I can assist you better."
    });
  }
});

    socket.on("disconnect", () => {
    });
  });

  return io;
}

module.exports = initSocketServer;