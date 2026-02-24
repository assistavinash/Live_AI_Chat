const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");


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
      try {
        const userId = socket.user._id.toString();
        
        // STEP 1: CHECK REQUEST LIMIT BEFORE MAKING API CALL
        if (!aiService.canMakeRequest(userId)) {
          const remaining = aiService.getRemainingRequests(userId);
          socket.emit("limit-reached", { 
            code: 'DAILY_LIMIT',
            message: 'Daily limit reached, please try tomorrow ✨',
            remaining: remaining
          });
          return;
        }

        // STEP 2: GET CHAT HISTORY WITHOUT SAVING USER MESSAGE YET
        const vectors = await aiService.generateVector(messagePayLoad.content); 

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

        // STEP 3: GENERATE AI RESPONSE FIRST
        const response = await aiService.generateResponse([...ltm, ...stm], userId);
        
        // STEP 4: CHECK FOR VALID RESPONSE
        if (!response || !response.trim()) {
          throw { code: 'EMPTY_RESPONSE', message: 'Empty response from AI' };
        }

        // STEP 5: IF SUCCESS → SAVE BOTH MESSAGES
        const [userMessage, responseMessage, responseVectors] = await Promise.all([
          messageModel.create({
            chat: messagePayLoad.chat,
            user: socket.user._id,
            content: messagePayLoad.content,
            role: "user",
          }),
          messageModel.create({
            chat: messagePayLoad.chat,
            user: socket.user._id, 
            content: response,
            role: "model",
          }),
          aiService.generateVector(response),
        ]);

        // Save memory (safe to fail silently)
        await createMemory({
          vectors: responseVectors,
          messageId: responseMessage._id,
          metadata: {
            chat: messagePayLoad.chat,
            user: socket.user._id,
            text: response,
          },
        }).catch(() => {});

        // Increment request count only on successful response
        aiService.incrementRequestCount(userId);

        const remaining = aiService.getRemainingRequests(userId);
        socket.emit("ai-response", {
          content: response,
          chat: messagePayLoad.chat,
          remaining: remaining
        });
      } catch (error) {
        console.log("AI Generation Error:", error);
        
        // IF ERROR → SAVE NOTHING, EMIT ERROR EVENT
        // Handle specific error codes
        if (error.code === 'QUOTA_EXCEEDED') {
          socket.emit("limit-reached", { 
            code: error.code,
            message: error.message
          });
        } else if (error.code === 'SERVICE_BUSY') {
          socket.emit("ai-response-failed", { 
            code: error.code,
            message: error.message
          });
        } else {
          socket.emit("ai-response-failed", { 
            code: "AI_RESPONSE_FAILED",
            message: error.message || 'Something went wrong, please try again'
          });
        }
      }
    });
  });

  return io;
}

module.exports = initSocketServer;