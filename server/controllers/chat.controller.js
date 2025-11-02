const ChatService = require("../services/chat.service");
const { catchAsync } = require("../utils/catchAsync");

// ================================
// LẤY TẤT CẢ CÁC CHAT CỦA USER
// GET /api/chats
// ================================
exports.getAllChatsForUser = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id; // tuỳ theo cách bạn lưu user từ token hoặc query
  const data = await new ChatService().getAllChatsForUser(userId);

  res.status(200).json({
    status: "success",
    data,
  });
});

// ================================
// LẤY DANH SÁCH TIN NHẮN TRONG CHAT
// GET /api/chats/:chatId/messages
// ================================
exports.getMessagesByChat = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user.user_id;
  const data = await new ChatService().getMessagesByChat(chatId, userId);

  res.status(200).json({
    status: "success",
    data,
  });
});

// ================================
// GỬI TIN NHẮN MỚI
// POST /api/messages
// ================================
exports.sendMessage = catchAsync(async (req, res, next) => {
  const { chat_id, sender_id, content, type } = req.body;

  let file = req.file;

  const data = await new ChatService().sendMessage({
    chat_id,
    sender_id,
    content,
    type,
    file,
  });

  res.status(201).json({
    status: "success",
    data,
  });
});

// ================================
// CẬP NHẬT MÀU CHAT
// PATCH /api/chats/:chatId/color
// ================================
exports.updateChatColor = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { color } = req.body;
  const userId = req.user.user_id;

  const data = await new ChatService().updateChatColor(chatId, color, userId);

  res.status(200).json({
    status: "success",
    data,
  });
});

// ================================
// BLOCK USER TRONG CHAT
// POST /api/chats/:chatId/block
// ================================
exports.blockUser = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { user_id } = req.body;
  const blockerId = req.user.user_id;

  const data = await new ChatService().blockUser(chatId, user_id, blockerId);

  res.status(200).json({
    status: "success",
    data,
  });
});

// ================================
// UNBLOCK USER TRONG CHAT
// POST /api/chats/:chatId/unblock
// ================================
exports.unblockUser = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { user_id } = req.body;
  const unblockerId = req.user.user_id;

  const data = await new ChatService().unblockUser(
    chatId,
    user_id,
    unblockerId
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

// ================================
// RỜI NHÓM
// POST /api/chats/:chatId/leave
// ================================
exports.leaveGroup = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user.user_id;

  const data = await new ChatService().leaveGroup(chatId, userId);

  res.status(200).json({
    status: "success",
    data,
  });
});

// ================================
// LẤY MEDIA FILES TRONG CHAT
// GET /api/chats/:chatId/media
// ================================
exports.getMediaFiles = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user.user_id;
  const { type } = req.query;
  const data = await new ChatService().getMediaFiles(chatId, userId, type);

  res.status(200).json({
    status: "success",
    data,
  });
});

// ================================
// TẠO CHAT MỚI
// POST /api/chats
// ================================
exports.createChat = catchAsync(async (req, res, next) => {
  const { name, isGroup, members, chatColor } = req.body;
  const createdBy = req.user.user_id;

  const data = await new ChatService().createChat({
    name,
    isGroup,
    members,
    createdBy,
    chatColor,
  });

  res.status(201).json({
    status: "success",
    data,
  });
});

// ================================
// THÊM MEMBERS VÀO GROUP
// POST /api/chats/:chatId/members
// ================================
exports.addMembers = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const { userIds } = req.body;
  const addedBy = req.user.user_id;

  const data = await new ChatService().addMembersToGroup(
    chatId,
    userIds,
    addedBy
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

// ================================
// XÓA MEMBER KHỎI GROUP
// DELETE /api/chats/:chatId/members/:userId
// ================================
exports.removeMember = catchAsync(async (req, res, next) => {
  const { chatId, userId } = req.params;
  const removedBy = req.user.user_id;

  const data = await new ChatService().removeMemberFromGroup(
    chatId,
    userId,
    removedBy
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

// ================================
// LẤY CHI TIẾT CHAT
// GET /api/chats/:chatId
// ================================
exports.getChatById = catchAsync(async (req, res, next) => {
  const { chatId } = req.params;
  const userId = req.user.user_id;

  const data = await new ChatService().getChatById(chatId, userId);

  res.status(200).json({
    status: "success",
    data,
  });
});
