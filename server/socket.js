// socket.js
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

let io; // biến tạm để lưu instance socket

// Map để lưu user_id -> socket_id
const userSockets = new Map();

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      credentials: true,
    },
  });

  // Middleware để verify token
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication error"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    console.log("✅ Client connected:", socket.id, "User:", socket.userId);

    // Lưu mapping user -> socket
    userSockets.set(socket.userId, socket.id);

    // Emit user online status
    socket.broadcast.emit("user_online", { userId: socket.userId });

    // ====================
    // JOIN CHAT ROOM
    // ====================
    socket.on("join_chat", (chatId) => {
      socket.join(`chat_${chatId}`);
      console.log(`User ${socket.userId} joined chat ${chatId}`);
    });

    // ====================
    // LEAVE CHAT ROOM
    // ====================
    socket.on("leave_chat", (chatId) => {
      socket.leave(`chat_${chatId}`);
      console.log(`User ${socket.userId} left chat ${chatId}`);
    });

    // ====================
    // SEND MESSAGE
    // ====================
    socket.on("send_message", (message) => {
      console.log("📨 Message received:", message);

      // Emit to all users in chat room (including sender)
      io.to(`chat_${message.chat_id}`).emit("new_message", message);
    });

    // ====================
    // TYPING INDICATOR
    // ====================
    socket.on("typing", ({ chatId, userName, isTyping }) => {
      socket.to(`chat_${chatId}`).emit("user_typing", {
        chatId,
        userName,
        userId: socket.userId,
        isTyping,
      });
    });

    // ====================
    // MARK MESSAGES AS READ
    // ====================
    socket.on("mark_read", ({ chatId, messageIds }) => {
      socket.to(`chat_${chatId}`).emit("messages_read", {
        chatId,
        messageIds,
        userId: socket.userId,
      });
    });

    // ====================
    // NEW CHAT CREATED
    // ====================
    socket.on("chat_created", ({ chat, memberIds }) => {
      // Notify all members
      memberIds.forEach((userId) => {
        const socketId = userSockets.get(userId);
        if (socketId) {
          io.to(socketId).emit("new_chat", chat);
        }
      });
    });

    // ====================
    // MEMBER ADDED TO GROUP
    // ====================
    socket.on("member_added", ({ chatId, newMembers, systemMessage }) => {
      // Emit to chat room
      io.to(`chat_${chatId}`).emit("group_member_added", {
        chatId,
        newMembers,
        systemMessage,
      });

      // Notify new members
      newMembers.forEach((member) => {
        const socketId = userSockets.get(member.user_id);
        if (socketId) {
          io.to(socketId).emit("added_to_group", { chatId });
        }
      });
    });

    // ====================
    // MEMBER REMOVED FROM GROUP
    // ====================
    socket.on("member_removed", ({ chatId, userId, systemMessage }) => {
      // Emit to chat room
      io.to(`chat_${chatId}`).emit("group_member_removed", {
        chatId,
        userId,
        systemMessage,
      });

      // Notify removed member
      const socketId = userSockets.get(userId);
      if (socketId) {
        io.to(socketId).emit("removed_from_group", { chatId });
      }
    });

    // ====================
    // CHAT COLOR UPDATED
    // ====================
    socket.on("chat_color_updated", ({ chatId, color }) => {
      io.to(`chat_${chatId}`).emit("chat_color_changed", { chatId, color });
    });

    // ====================
    // USER BLOCKED
    // ====================
    socket.on("user_blocked", ({ chatId, userId }) => {
      console.log(`🚫 User ${userId} blocked in chat ${chatId}`);

      // Notify all users in chat room
      io.to(`chat_${chatId}`).emit("user_blocked", { chatId, userId });

      // Also notify the blocked user directly
      const blockedUserSocketId = userSockets.get(userId);
      if (blockedUserSocketId) {
        io.to(blockedUserSocketId).emit("user_blocked", { chatId, userId });
      }
    });

    // ====================
    // USER UNBLOCKED
    // ====================
    socket.on("user_unblocked", ({ chatId, userId }) => {
      console.log(`✅ User ${userId} unblocked in chat ${chatId}`);

      // Notify all users in chat room
      io.to(`chat_${chatId}`).emit("user_unblocked", { chatId, userId });

      // Also notify the unblocked user directly
      const unblockedUserSocketId = userSockets.get(userId);
      if (unblockedUserSocketId) {
        io.to(unblockedUserSocketId).emit("user_unblocked", { chatId, userId });
      }
    });

    // ====================
    // JOIN PROJECT ROOM
    // ====================
    socket.on("join_project", (projectId) => {
      socket.join(`project_${projectId}`);
      console.log(
        `User ${socket.userId} joined project room ${projectId}`
      );
    });

    // ====================
    // LEAVE PROJECT ROOM
    // ====================
    socket.on("leave_project", (projectId) => {
      socket.leave(`project_${projectId}`);
      console.log(
        `User ${socket.userId} left project room ${projectId}`
      );
    });

    // ====================
    // DISCONNECT
    // ====================
    socket.on("disconnect", () => {
      console.log("❌ Client disconnected:", socket.id, "User:", socket.userId);

      // Remove from userSockets map
      userSockets.delete(socket.userId);

      // Emit user offline status
      socket.broadcast.emit("user_offline", { userId: socket.userId });
    });
  });

  return io;
}

function getIO() {
  if (!io) throw new Error("Socket.io not initialized!");
  return io;
}

function getUserSocket(userId) {
  return userSockets.get(userId);
}

module.exports = { initSocket, getIO, getUserSocket };
