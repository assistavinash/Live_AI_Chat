const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

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
    
      const message = await messageModel.create({
        chat: messagePayLoad.chat,
        user: socket.user._id,
        content: messagePayLoad.content,
        role: "user",
      });

      const vectors = await aiService.generateVector(messagePayLoad.content); 




      /*
      const memory = await queryMemory({
        queryVector: vectors,
        limit: 3,
        metadata: {},
      });

      const chatHistory = (
        await messageModel
          .find({ chat: messagePayLoad.chat })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse(); */

      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryVector: vectors,
          limit: 3,
          metadata: {
            user: socket.user._id,
          },
        }),
        messageModel
          .find({ chat: messagePayLoad.chat })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean(),
      ]);

      const stm = chatHistory.map((item) => ({
        role: item.role,
        parts: [{ text: item.content }],
      }));


      const ltm = [
        {
          role: "user",
          parts: [
            {
              text: `These are some previous messages from the chat, use them to generate a response:\n${memory
                .map((item) => item.metadata.text)
                .join("\n")}`,
            },
          ],
        },
      ];


      

      const response = await aiService.generateResponse([...ltm, ...stm]);

      /*
      const responseMessage = await messageModel.create({
        chat: messagePayLoad.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      }); 

      const responseVectors = await aiService.generateVector(response); */
      const [responseMessage, responseVectors] = await Promise.all([ 
        messageModel.create({
          chat: messagePayLoad.chat,
          user: socket.user._id, 
          content: response,
          role: "model",
        }),
        aiService.generateVector(response),
      ]);

      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metadata: {
          chat: messagePayLoad.chat,
          user: socket.user._id,
          text: response,
        },
      });

      socket.emit("ai-response", {
        content: response,
        chat: messagePayLoad.chat,
      });
    });
  });

  return io;
}

module.exports = initSocketServer;