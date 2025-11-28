const AiChatbotService = require("../services/aichatbot.service");
const ChatService = require("../services/chat.service");
const { catchAsync } = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

// ================================
// CREATE AI CHAT FOR PROJECT
// POST /api/ai-chat/:projectId
// ================================
exports.createAIChatForProject = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.user_id;

  // Check if AI chat already exists for this project
  const existingChat = await new ChatService().getAllChatsForUser(userId);
  const aiChat = existingChat.find(
    (chat) => chat.is_ai && chat.name === `AI Assistant - ${projectId}`
  );

  if (aiChat) {
    return res.status(200).json({
      status: "success",
      data: aiChat,
    });
  }

  // Create new AI chat
  const chatData = {
    name: `AI Assistant - ${projectId}`,
    isGroup: false,
    members: [], // AI chat has no other members
    createdBy: userId,
    chatColor: "#10b981", // Green color for AI
    isAI: true,
  };

  // Create chat with is_ai flag
  const chat = await new ChatService().createAIChat(chatData, projectId);

  res.status(201).json({
    status: "success",
    data: chat,
  });
});

// ================================
// SEND MESSAGE TO AI CHAT
// POST /api/ai-chat/:projectId/message
// ================================
exports.sendAIMessage = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { message, chatId } = req.body;
  const userId = req.user.user_id;

  if (!message || !chatId) {
    throw new ApiError("Message and chatId are required", 400);
  }

  // Save user message first
  const chatService = new ChatService();
  const userMessage = await chatService.sendMessage({
    chat_id: chatId,
    sender_id: userId,
    content: message,
    type: "text",
  });

  // Generate AI response
  const aiService = new AiChatbotService();
  const aiResponse = await aiService.generateResponse(
    userId,
    projectId,
    message
  );

  // Save AI response
  const aiMessage = await chatService.sendMessage({
    chat_id: chatId,
    sender_id: null, // AI messages have null sender_id
    content: aiResponse,
    type: "text",
  });

  res.status(200).json({
    status: "success",
    data: {
      userMessage,
      aiMessage,
    },
  });
});

// ================================
// GET PROJECT CONTEXT FOR AI
// GET /api/ai-chat/:projectId/context
// ================================
exports.getProjectContext = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const userId = req.user.user_id;

  const aiService = new AiChatbotService();
  const context = await aiService.getProjectContext(userId, projectId);

  res.status(200).json({
    status: "success",
    data: {
      stats: context.stats,
      taskCount: context.tasks.length,
      sprintCount: context.sprints.length,
      memberCount: context.members.length,
    },
  });
});

// ================================
// GENERATE TASK DESCRIPTION WITH AI
// POST /api/ai-chat/:projectId/generate-description
// ================================
exports.generateTaskDescription = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { prompt } = req.body;
  const userId = req.user.user_id;

  if (!prompt) {
    throw new ApiError("Prompt is required", 400);
  }

  const aiService = new AiChatbotService();
  const description = await aiService.generateTaskDescription(
    userId,
    projectId,
    prompt
  );

  res.status(200).json({
    status: "success",
    data: {
      description,
    },
  });
});

// ================================
// GENERATE TASK SUMMARY WITH AI
// POST /api/ai-chat/:projectId/task/:taskId/summary
// ================================
exports.generateTaskSummary = catchAsync(async (req, res, next) => {
  const { projectId, taskId } = req.params;
  const userId = req.user.user_id;

  const aiService = new AiChatbotService();
  const result = await aiService.generateTaskSummary(userId, projectId, taskId);

  res.status(200).json({
    status: "success",
    data: result,
  });
});
