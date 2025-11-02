const { Op, fn, col } = require("sequelize");
const { sequelize } = require("../config/database");
const ApiError = require("../utils/ApiError");
const { uploadFile } = require("../utils/uploadImg");
const ChatMember = require("../models/ChatMember");
const Chat = require("../models/Chat");
const MediaFile = require("../models/MediaFile");
const Message = require("../models/Message");

class ChatService {
  /**
   * Lấy tất cả các cuộc chat mà user tham gia
   * @param {number} userId
   */
  async getAllChatsForUser(userId) {
    try {
      const chats = await Chat.findAll({
        include: [
          {
            model: User,
            as: "members",
            attributes: [
              "user_id",
              [
                fn(
                  "CONCAT",
                  col("members.first_name"),
                  " ",
                  col("members.last_name")
                ),
                "name",
              ],
              ,
              "email",
            ],
            through: { attributes: [] },
            where: { user_id: userId },
          },
        ],
      });

      return chats;
    } catch (err) {
      throw new ApiError("Không thể lấy danh sách chat", 500);
    }
  }

  /**
   * Lấy tất cả message của 1 chat
   * @param {number} chatId
   */
  async getMessagesByChat(chatId) {
    try {
      const messages = await Message.findAll({
        where: { chat_id: chatId },
        include: [
          {
            model: User,
            as: "sender",
            attributes: [
              "user_id",
              [
                fn(
                  "CONCAT",
                  col("sender.first_name"),
                  " ",
                  col("sender.last_name")
                ),
                "name",
              ],
              ,
              "email",
            ],
          },
        ],
        order: [["timestamp", "ASC"]],
      });

      return messages;
    } catch (err) {
      throw new ApiError("Không thể lấy danh sách tin nhắn", 500);
    }
  }

  /**
   * Gửi 1 tin nhắn mới
   * @param {object} data { chat_id, sender_id, content, type, file_url }
   */
  async sendMessage(data) {
    try {
      const { chat_id, sender_id, content, type } = data;

      const member = await ChatMember.findOne({
        where: { chat_id, user_id: sender_id },
      });

      if (!member) throw new ApiError("Bạn không thuộc nhóm chat này", 403);

      let file_url = null;
      if (data.file) {
        file_url = await uploadFile(data.file);
      }

      const messageData = {
        chat_id,
        sender_id,
        content,
        type,
        file_url,
      };

      const message = await Message.create(messageData);

      return message;
    } catch (err) {
      throw new ApiError("Không thể gửi tin nhắn", 500);
    }
  }

  /**
   * Cập nhật màu chat
   * @param {number} chatId
   * @param {string} color
   */
  async updateChatColor(chatId, color) {
    try {
      const chat = await Chat.findByPk(chatId);
      if (!chat) throw new ApiError("Không tìm thấy chat", 404);

      chat.chat_color = color;
      await chat.save();
      return chat;
    } catch (err) {
      throw new ApiError("Không thể cập nhật màu chat", 500);
    }
  }

  /**
   * Block user trong chat (giả sử có cờ is_blocked trong bảng ChatMember)
   * @param {number} chatId
   * @param {number} userId
   */
  async blockUser(chatId, userId) {
    try {
      const member = await ChatMember.findOne({
        where: { chat_id: chatId, user_id: userId },
      });
      if (!member) throw new ApiError("Không tìm thấy user trong chat", 404);

      // Nếu bảng ChatMember chưa có cột is_blocked thì bạn thêm vào schema nha
      member.is_blocked = true;
      await member.save();

      return { message: "User đã bị block trong chat này" };
    } catch (err) {
      throw new ApiError("Không thể block user", 500);
    }
  }

  /**
   * Rời nhóm (xóa user khỏi ChatMember)
   * @param {number} chatId
   * @param {number} userId
   */
  async leaveGroup(chatId, userId) {
    try {
      const deleted = await ChatMember.destroy({
        where: { chat_id: chatId, user_id: userId },
      });

      if (!deleted) throw new ApiError("User không ở trong nhóm", 404);

      return { message: "Bạn đã rời nhóm thành công" };
    } catch (err) {
      throw new ApiError("Không thể rời nhóm", 500);
    }
  }

  /**
   * Lấy danh sách media files trong chat
   * @param {number} chatId
   */
  async getMediaFiles(chatId) {
    try {
      const files = await MediaFile.findAll({
        where: { chat_id: chatId },
        order: [["uploaded_at", "DESC"]],
      });

      return files;
    } catch (err) {
      throw new ApiError("Không thể lấy media files", 500);
    }
  }
}

module.exports = ChatService;

// const { Op, fn, col, literal } = require("sequelize");
// const { sequelize } = require("../config/database");
// const ApiError = require("../utils/ApiError");
// const { uploadFile, uploadImg } = require("../utils/uploadImg");
// const ChatMember = require("../models/ChatMember");
// const Chat = require("../models/Chat");
// const MediaFile = require("../models/MediaFile");
// const Message = require("../models/Message");
// const User = require("../models/User"); // ⚠️ THIẾU IMPORT NÀY

// class ChatService {
//   /**
//    * Lấy tất cả các cuộc chat mà user tham gia
//    * @param {number} userId
//    */
//   async getAllChatsForUser(userId) {
//     try {
//       const chats = await Chat.findAll({
//         include: [
//           {
//             model: ChatMember,
//             as: "chatMembers",
//             where: { user_id: userId },
//             attributes: [],
//           },
//           {
//             model: User,
//             as: "members",
//             attributes: [
//               "user_id",
//               [
//                 fn(
//                   "CONCAT",
//                   col("members.first_name"),
//                   " ",
//                   col("members.last_name")
//                 ),
//                 "name",
//               ],
//               "avatar", // ⚠️ FIX: Thêm avatar
//               "email",
//             ],
//             through: { attributes: [] },
//           },
//           {
//             // ⚠️ THÊM: Lấy tin nhắn cuối cùng
//             model: Message,
//             as: "messages",
//             separate: true,
//             limit: 1,
//             order: [["timestamp", "DESC"]],
//             attributes: ["content", "timestamp", "type"],
//           },
//         ],
//         order: [
//           // ⚠️ THÊM: Sắp xếp theo tin nhắn mới nhất
//           [
//             literal(
//               "(SELECT MAX(timestamp) FROM messages WHERE messages.chat_id = Chat.chat_id)"
//             ),
//             "DESC",
//           ],
//         ],
//       });

//       // Format lại data cho frontend
//       return chats.map((chat) => {
//         const lastMsg = chat.lastMessage?.[0];
//         return {
//           chat_id: chat.chat_id,
//           name: chat.name,
//           //   avatar: chat.chat_avatar,
//           isGroup: chat.is_group,
//           members: chat.members,
//           chatColor: chat.chat_color,
//           lastMessage: lastMsg ? lastMsg.content : null,
//           lastMessageTime: lastMsg ? lastMsg.timestamp : null,
//           unreadCount: 0, // TODO: Implement unread logic
//           memberDetails: chat.members, // Giữ lại info đầy đủ nếu cần
//         };
//       });
//     } catch (err) {
//       console.error("getAllChatsForUser error:", err);
//       throw new ApiError("Không thể lấy danh sách chat", 500);
//     }
//   }

//   /**
//    * Lấy tất cả message của 1 chat
//    * @param {number} chatId
//    * @param {number} userId - User đang request (để check quyền)
//    */
//   async getMessagesByChat(chatId, userId) {
//     try {
//       const member = await ChatMember.findOne({
//         where: { chat_id: chatId, user_id: userId },
//       });

//       if (!member) {
//         throw new ApiError("Bạn không có quyền truy cập chat này", 403);
//       }

//       const messages = await Message.findAll({
//         where: { chat_id: chatId },
//         include: [
//           {
//             model: User,
//             as: "sender",
//             attributes: [
//               "user_id",
//               [
//                 fn(
//                   "CONCAT",
//                   col("sender.first_name"),
//                   " ",
//                   col("sender.last_name")
//                 ),
//                 "name",
//               ],
//               "avatar", // ⚠️ FIX: Thêm avatar
//               "email",
//             ],
//           },
//         ],
//         order: [["timestamp", "ASC"]],
//       });

//       // Format cho frontend
//       return messages.map((msg) => ({
//         message_id: msg.message_id,
//         chatId: msg.chat_id,
//         senderId: msg.sender_id,
//         senderName: msg.sender ? msg.sender.name : "Unknown",
//         senderAvatar: msg.sender?.avatar,
//         content: msg.content,
//         type: msg.type,
//         fileUrl: msg.file_url,
//         fileName: msg.file_name, // ⚠️ THÊM nếu có trong model
//         timestamp: msg.timestamp,
//       }));
//     } catch (err) {
//       console.error("getMessagesByChat error:", err);
//       throw new ApiError(
//         err.message || "Không thể lấy danh sách tin nhắn",
//         err.statusCode || 500
//       );
//     }
//   }

//   /**
//    * Gửi 1 tin nhắn mới
//    * @param {object} data { chat_id, sender_id, content, type, file }
//    */
//   async sendMessage(data) {
//     const transaction = await sequelize.transaction(); // ⚠️ THÊM transaction

//     try {
//       const { chat_id, sender_id, content, type, file } = data;

//       // Check user có trong chat không
//       const member = await ChatMember.findOne({
//         where: { chat_id, user_id: sender_id },
//         transaction,
//       });

//       if (!member) {
//         throw new ApiError("Bạn không thuộc nhóm chat này", 403);
//       }

//       // ⚠️ FIX: Check member có bị block không (nếu có field này)
//       if (member.is_blocked) {
//         throw new ApiError("Bạn đã bị chặn trong chat này", 403);
//       }

//       let file_url = null;
//       let file_name = null;
//       let file_type = null;

//       // Upload file nếu có
//       if (file) {
//         if (file.mimetype.startsWith("image/")) {
//           file_url = await uploadImg(file);
//         } else {
//           file_url = await uploadFile(file);
//         }
//         file_name = file.originalname;
//         file_type = file.mimetype.startsWith("image/") ? "image" : "file";

//         await MediaFile.create(
//           {
//             chat_id,
//             url: file_url,
//             file_name,
//             type,
//             // uploaded_by: sender_id,
//             uploaded_at: new Date(),
//           },
//           { transaction }
//         );
//       }

//       const messageData = {
//         chat_id,
//         sender_id,
//         content: content || "",
//         type: file_type || type || "text",
//         file_url,
//         file_name,
//         timestamp: new Date(),
//       };

//       const message = await Message.create(messageData, { transaction });

//       // ⚠️ THÊM: Update last message của chat
//       await Chat.update(
//         {
//           last_message: content || file_name,
//           last_message_time: new Date(),
//         },
//         {
//           where: { chat_id },
//           transaction,
//         }
//       );

//       await transaction.commit();

//       const sender = await User.findByPk(sender_id, {
//         attributes: ["user_id", "first_name", "last_name", "avatar"],
//       });

//       return {
//         message_id: message.message_id,
//         chatId: message.chat_id,
//         senderId: message.sender_id,
//         senderName: sender
//           ? `${sender.first_name} ${sender.last_name}`
//           : "Unknown",
//         senderAvatar: sender?.avatar,
//         content: message.content,
//         type: message.type,
//         fileUrl: message.file_url,
//         fileName: message.file_name,
//         timestamp: message.timestamp,
//       };
//     } catch (err) {
//       await transaction.rollback();
//       console.error("sendMessage error:", err);
//       throw new ApiError(
//         err.message || "Không thể gửi tin nhắn",
//         err.statusCode || 500
//       );
//     }
//   }

//   /**
//    * Cập nhật màu chat
//    * @param {number} chatId
//    * @param {string} color
//    * @param {number} userId - User đang request
//    */
//   async updateChatColor(chatId, color, userId) {
//     try {
//       // ⚠️ THÊM: Check quyền
//       const member = await ChatMember.findOne({
//         where: { chat_id: chatId, user_id: userId },
//       });

//       if (!member) {
//         throw new ApiError("Bạn không có quyền thay đổi màu chat này", 403);
//       }

//       const chat = await Chat.findByPk(chatId);
//       if (!chat) throw new ApiError("Không tìm thấy chat", 404);

//       chat.chat_color = color;
//       await chat.save();

//       return {
//         chatId: chat.chat_id,
//         chatColor: chat.chat_color,
//       };
//     } catch (err) {
//       console.error("updateChatColor error:", err);
//       throw new ApiError(
//         err.message || "Không thể cập nhật màu chat",
//         err.statusCode || 500
//       );
//     }
//   }

//   /**
//    * Block user trong chat (1-1 chat only)
//    * @param {number} chatId
//    * @param {number} userId - User đang bị block
//    * @param {number} blockerId - User thực hiện block
//    */
//   async blockUser(chatId, userId, blockerId) {
//     try {
//       const chat = await Chat.findByPk(chatId);
//       if (!chat) throw new ApiError("Không tìm thấy chat", 404);

//       //   // ⚠️ FIX: Chỉ cho block trong 1-1 chat
//       //   if (chat.is_group) {
//       //     throw new ApiError("Không thể block user trong group chat", 400);
//       //   }

//       const member = await ChatMember.findOne({
//         where: { chat_id: chatId, user_id: userId },
//       });

//       if (!member) throw new ApiError("Không tìm thấy user trong chat", 404);

//       // Nếu bảng ChatMember chưa có cột is_blocked thì bạn thêm vào migration
//       member.is_blocked = true;
//       member.blocked_by = blockerId; // ⚠️ THÊM: Lưu người block
//       member.blocked_at = new Date();
//       await member.save();

//       return {
//         success: true,
//         message: "User đã bị block trong chat này",
//       };
//     } catch (err) {
//       console.error("blockUser error:", err);
//       throw new ApiError(
//         err.message || "Không thể block user",
//         err.statusCode || 500
//       );
//     }
//   }

//   /**
//    * Rời nhóm (group chat only)
//    * @param {number} chatId
//    * @param {number} userId
//    */
//   async leaveGroup(chatId, userId) {
//     const transaction = await sequelize.transaction();

//     try {
//       const chat = await Chat.findByPk(chatId, { transaction });
//       if (!chat) throw new ApiError("Không tìm thấy chat", 404);

//       // ⚠️ FIX: Chỉ cho rời group
//       if (!chat.is_group) {
//         throw new ApiError("Không thể rời khỏi chat 1-1", 400);
//       }

//       const deleted = await ChatMember.destroy({
//         where: { chat_id: chatId, user_id: userId },
//         transaction,
//       });

//       if (!deleted) throw new ApiError("User không ở trong nhóm", 404);

//       // ⚠️ THÊM: Tạo system message
//       await Message.create(
//         {
//           chat_id: chatId,
//           sender_id: userId,
//           content: "đã rời khỏi nhóm",
//           type: "system",
//           timestamp: new Date(),
//         },
//         { transaction }
//       );

//       await transaction.commit();

//       return {
//         success: true,
//         message: "Bạn đã rời nhóm thành công",
//       };
//     } catch (err) {
//       await transaction.rollback();
//       console.error("leaveGroup error:", err);
//       throw new ApiError(
//         err.message || "Không thể rời nhóm",
//         err.statusCode || 500
//       );
//     }
//   }

//   /**
//    * Lấy danh sách media files trong chat
//    * @param {number} chatId
//    * @param {number} userId - User đang request
//    * @param {string} type - 'image' | 'file' | 'all'
//    */
//   async getMediaFiles(chatId, userId, type = "all") {
//     try {
//       // ⚠️ THÊM: Check quyền
//       const member = await ChatMember.findOne({
//         where: { chat_id: chatId, user_id: userId },
//       });

//       if (!member) {
//         throw new ApiError("Bạn không có quyền truy cập chat này", 403);
//       }

//       const whereClause = { chat_id: chatId };
//       if (type !== "all") {
//         whereClause.file_type = type;
//       }

//       const files = await MediaFile.findAll({
//         where: whereClause,
//         include: [
//           {
//             model: User,
//             as: "uploader",
//             attributes: ["user_id", "first_name", "last_name", "avatar"],
//           },
//         ],
//         order: [["uploaded_at", "DESC"]],
//       });

//       // Format cho frontend
//       return files.map((file) => ({
//         id: file.file_id,
//         chatId: file.chat_id,
//         url: file.file_url,
//         name: file.file_name,
//         type: file.file_type,
//         uploadedBy: file.uploaded_by,
//         uploaderName: file.uploader
//           ? `${file.uploader.first_name} ${file.uploader.last_name}`
//           : "Unknown",
//         timestamp: file.uploaded_at,
//       }));
//     } catch (err) {
//       console.error("getMediaFiles error:", err);
//       throw new ApiError(
//         err.message || "Không thể lấy media files",
//         err.statusCode || 500
//       );
//     }
//   }

//   /**
//    * ⚠️ THÊM MỚI: Tạo chat mới
//    * @param {object} data { name, isGroup, members, createdBy }
//    */
//   async createChat(data) {
//     const transaction = await sequelize.transaction();

//     try {
//       const { name, isGroup, members, createdBy, chatColor } = data;

//       // Validate
//       if (isGroup && (!members || members.length < 2)) {
//         throw new ApiError("Group chat cần ít nhất 2 thành viên", 400);
//       }

//       if (!isGroup && members.length !== 1) {
//         throw new ApiError("1-1 chat chỉ được 1 người nhận", 400);
//       }

//       // Check 1-1 chat đã tồn tại chưa
//       if (!isGroup) {
//         const existingChat = await Chat.findOne({
//           where: { is_group: false },
//           include: [
//             {
//               model: ChatMember,
//               as: "chatMembers",
//               where: {
//                 user_id: { [Op.in]: [createdBy, members[0]] },
//               },
//             },
//           ],
//           having: sequelize.literal("COUNT(DISTINCT chatMembers.user_id) = 2"),
//           group: ["Chat.chat_id"],
//         });

//         if (existingChat) {
//           throw new ApiError("Chat với user này đã tồn tại", 400);
//         }
//       }

//       // Tạo chat
//       const chatData = {
//         chat_name: name,
//         is_group: isGroup,
//         chat_color: chatColor || "#cb0404",
//         created_by: createdBy,
//         created_at: new Date(),
//       };

//       const chat = await Chat.create(chatData, { transaction });

//       // Thêm members
//       const allMembers = isGroup
//         ? [createdBy, ...members]
//         : [createdBy, members[0]];
//       const uniqueMembers = [...new Set(allMembers)];

//       await ChatMember.bulkCreate(
//         uniqueMembers.map((userId) => ({
//           chat_id: chat.chat_id,
//           user_id: userId,
//           joined_at: new Date(),
//         })),
//         { transaction }
//       );

//       // Tạo system message cho group
//       if (isGroup) {
//         await Message.create(
//           {
//             chat_id: chat.chat_id,
//             sender_id: createdBy,
//             content: "đã tạo nhóm",
//             type: "system",
//             timestamp: new Date(),
//           },
//           { transaction }
//         );
//       }

//       await transaction.commit();

//       // Lấy lại chat với đầy đủ thông tin
//       const fullChat = await this.getChatById(chat.chat_id, createdBy);
//       return fullChat;
//     } catch (err) {
//       await transaction.rollback();
//       console.error("createChat error:", err);
//       throw new ApiError(
//         err.message || "Không thể tạo chat",
//         err.statusCode || 500
//       );
//     }
//   }

//   /**
//    * ⚠️ THÊM MỚI: Lấy thông tin 1 chat
//    * @param {number} chatId
//    * @param {number} userId
//    */
//   async getChatById(chatId, userId) {
//     try {
//       const member = await ChatMember.findOne({
//         where: { chat_id: chatId, user_id: userId },
//       });

//       if (!member) {
//         throw new ApiError("Bạn không có quyền truy cập chat này", 403);
//       }

//       const chat = await Chat.findByPk(chatId, {
//         include: [
//           {
//             model: User,
//             as: "members",
//             attributes: [
//               "user_id",
//               "first_name",
//               "last_name",
//               "avatar",
//               "email",
//             ],
//             through: { attributes: [] },
//           },
//         ],
//       });

//       if (!chat) throw new ApiError("Không tìm thấy chat", 404);

//       return {
//         id: chat.chat_id,
//         name: chat.chat_name,
//         avatar: chat.chat_avatar,
//         isGroup: chat.is_group,
//         members: chat.members.map((m) => m.user_id),
//         chatColor: chat.chat_color,
//         memberDetails: chat.members,
//       };
//     } catch (err) {
//       console.error("getChatById error:", err);
//       throw new ApiError(
//         err.message || "Không thể lấy thông tin chat",
//         err.statusCode || 500
//       );
//     }
//   }
// }

// module.exports = ChatService; // ⚠️ FIX: Export instance luôn
