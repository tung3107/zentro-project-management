const express = require("express");
const {
  getAllChatsForUser,
  getMessagesByChat,
  sendMessage,
  updateChatColor,
  blockUser,
  unblockUser,
  leaveGroup,
  getMediaFiles,
  createChat,
  addMembers,
  removeMember,
  getChatById,
} = require("../controllers/chat.controller");
const { protectRoute } = require("../controllers/auth.controller");
const upload = require("../middlewares/upload");

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(protectRoute);

// Chat routes
router.route("/").get(getAllChatsForUser).post(createChat);

router.route("/:chatId").get(getChatById);

router.route("/:chatId/messages").get(getMessagesByChat);

router.route("/messages").post(upload.single("file"), sendMessage);

router.route("/:chatId/color").put(updateChatColor);

router.route("/:chatId/members").post(addMembers);

router.route("/:chatId/members/:userId").delete(removeMember);

router.route("/:chatId/block").post(blockUser);

router.route("/:chatId/unblock").post(unblockUser);

router.route("/:chatId/leave").post(leaveGroup);

router.route("/:chatId/media").get(getMediaFiles);

module.exports = router;
