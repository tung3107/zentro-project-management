const { Op, fn, col, literal } = require("sequelize");
const { sequelize } = require("../config/database");
const ApiError = require("../utils/ApiError");
const { uploadFile, uploadImg } = require("../utils/uploadImg");
const ChatMember = require("../models/ChatMember");
const Chat = require("../models/Chat");
const MediaFile = require("../models/MediaFile");
const Message = require("../models/Message");
const User = require("../models/User"); // ⚠️ THIẾU IMPORT NÀY

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
            model: ChatMember,
            as: "chatMembers",
            where: { user_id: userId },
            attributes: [],
          },
          {
            model: User,
            as: "members",
            attributes: [
              "user_id",
              "first_name",
              "last_name",
              [
                fn(
                  "CONCAT",
                  col("members.first_name"),
                  " ",
                  col("members.last_name")
                ),
                "name",
              ],
              "avatar",
              "email",
            ],
            through: {
              attributes: ["is_blocked", "blocked_by", "blocked_at"],
            },
          },
          {
            // ⚠️ THÊM: Lấy tin nhắn cuối cùng
            model: Message,
            as: "messages",
            separate: true,
            limit: 1,
            order: [["timestamp", "DESC"]],
            attributes: ["content", "timestamp", "type"],
          },
        ],
        order: [
          // ⚠️ THÊM: Sắp xếp theo tin nhắn mới nhất
          [
            literal(
              "(SELECT MAX(timestamp) FROM messages WHERE messages.chat_id = Chat.chat_id)"
            ),
            "DESC",
          ],
        ],
      });

      // Format lại data cho frontend
      return chats.map((chat) => {
        const lastMsg = chat.messages?.[0];

        // Với chat 1-1, tìm người kia để lấy tên và avatar
        let displayName = chat.name;
        let displayAvatar = chat.chat_avatar;
        let isBlocked = false;
        let blockedBy = null;
        let iBlockedThem = false;
        let theyBlockedMe = false;

        if (!chat.is_group && chat.members.length === 2) {
          const otherUser = chat.members.find((m) => m.user_id !== userId);
          const currentUser = chat.members.find((m) => m.user_id === userId);

          if (otherUser) {
            displayName =
              `${otherUser.first_name || ""} ${
                otherUser.last_name || ""
              }`.trim() || otherUser.email;
            displayAvatar = otherUser.avatar;

            // Check block status
            // Kiểm tra xem người kia có bị block không
            if (otherUser.ChatMember && otherUser.ChatMember.is_blocked) {
              isBlocked = true;
              blockedBy = otherUser.ChatMember.blocked_by;
              // Nếu mình block họ
              if (blockedBy === userId) {
                iBlockedThem = true;
              }
            }

            // Kiểm tra xem mình có bị block không
            if (
              currentUser &&
              currentUser.ChatMember &&
              currentUser.ChatMember.is_blocked
            ) {
              isBlocked = true;
              blockedBy = currentUser.ChatMember.blocked_by;
              // Nếu họ block mình
              if (blockedBy === otherUser.user_id) {
                theyBlockedMe = true;
              }
            }
          }
        }

        return {
          chat_id: chat.chat_id,
          name: displayName,
          avatar: displayAvatar,
          is_group: chat.is_group,
          members: chat.members.map((m) => m.user_id),
          chat_color: chat.chat_color,
          lastMessage: lastMsg ? lastMsg.content : null,
          lastMessageTime: lastMsg ? lastMsg.timestamp : null,
          unreadCount: 0, // TODO: Implement unread logic
          memberDetails: chat.members, // Giữ lại info đầy đủ nếu cần
          isBlocked,
          blockedBy,
          iBlockedThem,
          theyBlockedMe,
        };
      });
    } catch (err) {
      console.error("getAllChatsForUser error:", err);
      throw new ApiError("Không thể lấy danh sách chat", 500);
    }
  }

  /**
   * Lấy tất cả message của 1 chat
   * @param {number} chatId
   * @param {number} userId - User đang request (để check quyền)
   */
  async getMessagesByChat(chatId, userId) {
    try {
      const member = await ChatMember.findOne({
        where: { chat_id: chatId, user_id: userId },
      });

      if (!member) {
        throw new ApiError("Bạn không có quyền truy cập chat này", 403);
      }

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
              "avatar", // ⚠️ FIX: Thêm avatar
              "email",
            ],
          },
        ],
        order: [["timestamp", "ASC"]],
      });

      // Format cho frontend
      return messages.map((msg) => ({
        message_id: msg.message_id,
        chat_id: msg.chat_id,
        sender_id: msg.sender_id,
        senderName: msg.sender ? msg.sender.name : "Unknown",
        senderAvatar: msg.sender?.avatar,
        content: msg.content,
        type: msg.type,
        file_url: msg.file_url,
        file_name:
          msg.type === "file" || msg.type === "image" ? msg.content : null, // Extract file name from content
        timestamp: msg.timestamp,
      }));
    } catch (err) {
      console.error("getMessagesByChat error:", err);
      throw new ApiError(
        err.message || "Không thể lấy danh sách tin nhắn",
        err.statusCode || 500
      );
    }
  }

  /**
   * Gửi 1 tin nhắn mới
   * @param {object} data { chat_id, sender_id, content, type, file }
   */
  async sendMessage(data) {
    const transaction = await sequelize.transaction(); // ⚠️ THÊM transaction

    try {
      const { chat_id, sender_id, content, type, file } = data;

      // Check user có trong chat không
      const member = await ChatMember.findOne({
        where: { chat_id, user_id: sender_id },
        transaction,
      });

      if (!member) {
        throw new ApiError("Bạn không thuộc nhóm chat này", 403);
      }

      // ⚠️ FIX: Check member có bị block không (nếu có field này)
      if (member.is_blocked) {
        throw new ApiError("Bạn đã bị chặn trong chat này", 403);
      }

      let file_url = null;
      let file_name = null;
      let file_type = null;

      // Upload file nếu có
      if (file) {
        if (file.mimetype.startsWith("image/")) {
          file_url = await uploadImg(file);
        } else {
          file_url = await uploadFile(file);
        }
        file_name = file.originalname;
        file_type = file.mimetype.startsWith("image/") ? "image" : "file";

        await MediaFile.create(
          {
            chat_id,
            url: file_url,
            file_name,
            type: file_type,
            uploaded_at: new Date(),
          },
          { transaction }
        );
      }

      const messageData = {
        chat_id,
        sender_id,
        content: content || file_name || "",
        type: file_type || type || "text",
        file_url,
        timestamp: new Date(),
      };

      const message = await Message.create(messageData, { transaction });

      //   // ⚠️ THÊM: Update last message của chat
      //   await Chat.update(
      //     {
      //       last_message: content || file_name,
      //       last_message_time: new Date(),
      //     },
      //     {
      //       where: { chat_id },
      //       transaction,
      //     }
      //   );

      await transaction.commit();

      const sender = await User.findByPk(sender_id, {
        attributes: ["user_id", "first_name", "last_name", "avatar"],
      });

      return {
        message_id: message.message_id,
        chat_id: message.chat_id,
        sender_id: message.sender_id,
        senderName: sender
          ? `${sender.first_name} ${sender.last_name}`
          : "Unknown",
        senderAvatar: sender?.avatar,
        content: message.content,
        type: message.type,
        file_url: message.file_url,
        file_name: file_name,
        timestamp: message.timestamp,
      };
    } catch (err) {
      await transaction.rollback();
      console.error("sendMessage error:", err);
      throw new ApiError(
        err.message || "Không thể gửi tin nhắn",
        err.statusCode || 500
      );
    }
  }

  /**
   * Cập nhật màu chat
   * @param {number} chatId
   * @param {string} color
   * @param {number} userId - User đang request
   */
  async updateChatColor(chatId, color, userId) {
    try {
      // ⚠️ THÊM: Check quyền
      const member = await ChatMember.findOne({
        where: { chat_id: chatId, user_id: userId },
      });

      if (!member) {
        throw new ApiError("Bạn không có quyền thay đổi màu chat này", 403);
      }

      const chat = await Chat.findByPk(chatId);
      if (!chat) throw new ApiError("Không tìm thấy chat", 404);

      chat.chat_color = color;
      await chat.save();

      return {
        chatId: chat.chat_id,
        chatColor: chat.chat_color,
      };
    } catch (err) {
      console.error("updateChatColor error:", err);
      throw new ApiError(
        err.message || "Không thể cập nhật màu chat",
        err.statusCode || 500
      );
    }
  }

  /**
   * Block user trong chat (1-1 chat only)
   * @param {number} chatId
   * @param {number} userId - User đang bị block
   * @param {number} blockerId - User thực hiện block
   */
  async blockUser(chatId, userId, blockerId) {
    try {
      const chat = await Chat.findByPk(chatId);
      if (!chat) throw new ApiError("Không tìm thấy chat", 404);

      //   // ⚠️ FIX: Chỉ cho block trong 1-1 chat
      //   if (chat.is_group) {
      //     throw new ApiError("Không thể block user trong group chat", 400);
      //   }

      const member = await ChatMember.findOne({
        where: { chat_id: chatId, user_id: userId },
      });

      if (!member) throw new ApiError("Không tìm thấy user trong chat", 404);

      // Nếu bảng ChatMember chưa có cột is_blocked thì bạn thêm vào migration
      member.is_blocked = true;
      member.blocked_by = blockerId; // ⚠️ THÊM: Lưu người block
      member.blocked_at = new Date();
      await member.save();

      return {
        success: true,
        message: "User đã bị block trong chat này",
      };
    } catch (err) {
      console.error("blockUser error:", err);
      throw new ApiError(
        err.message || "Không thể block user",
        err.statusCode || 500
      );
    }
  }

  /**
   * Unblock user trong chat (1-1 chat only)
   * @param {number} chatId
   * @param {number} userId - User đang bị unblock
   * @param {number} unblockerId - User thực hiện unblock
   */
  async unblockUser(chatId, userId, unblockerId) {
    try {
      const chat = await Chat.findByPk(chatId);
      if (!chat) throw new ApiError("Không tìm thấy chat", 404);

      const member = await ChatMember.findOne({
        where: { chat_id: chatId, user_id: userId },
      });

      if (!member) throw new ApiError("Không tìm thấy user trong chat", 404);

      // Chỉ người block mới có thể unblock
      if (member.blocked_by !== unblockerId) {
        throw new ApiError("Bạn không có quyền unblock user này", 403);
      }

      member.is_blocked = false;
      member.blocked_by = null;
      member.blocked_at = null;
      await member.save();

      return {
        success: true,
        message: "User đã được unblock",
      };
    } catch (err) {
      console.error("unblockUser error:", err);
      throw new ApiError(
        err.message || "Không thể unblock user",
        err.statusCode || 500
      );
    }
  }

  /**
   * Xóa member khỏi group
   * @param {number} chatId
   * @param {string} userId - User bị xóa
   * @param {string} removedBy - User thực hiện xóa
   */
  async removeMemberFromGroup(chatId, userId, removedBy) {
    const transaction = await sequelize.transaction();

    try {
      const chat = await Chat.findByPk(chatId, { transaction });
      if (!chat) throw new ApiError("Không tìm thấy chat", 404);

      if (!chat.is_group) {
        throw new ApiError("Chỉ có thể xóa member trong group chat", 400);
      }

      // Check quyền của người xóa (có thể chỉ cho creator xóa)
      const removerMember = await ChatMember.findOne({
        where: { chat_id: chatId, user_id: removedBy },
        transaction,
      });

      if (!removerMember) {
        throw new ApiError("Bạn không có quyền xóa member", 403);
      }

      // Xóa member
      const deleted = await ChatMember.destroy({
        where: { chat_id: chatId, user_id: userId },
        transaction,
      });

      if (!deleted) throw new ApiError("User không ở trong nhóm", 404);

      // Tạo system message
      const user = await User.findByPk(userId, {
        attributes: ["first_name", "last_name"],
      });

      await Message.create(
        {
          chat_id: chatId,
          sender_id: removedBy,
          content: `${user.first_name} ${user.last_name} đã bị xóa khỏi nhóm`,
          type: "text",
          timestamp: new Date(),
        },
        { transaction }
      );

      // Check if there are any members left
      const remainingMembers = await ChatMember.count({
        where: { chat_id: chatId },
        transaction,
      });

      // If no members left, delete the chat and all related data
      if (remainingMembers === 0) {
        await Message.destroy({ where: { chat_id: chatId }, transaction });
        await MediaFile.destroy({ where: { chat_id: chatId }, transaction });
        await Chat.destroy({ where: { chat_id: chatId }, transaction });
      }

      await transaction.commit();

      return {
        success: true,
        message: "Member đã bị xóa khỏi nhóm",
      };
    } catch (err) {
      await transaction.rollback();
      console.error("removeMemberFromGroup error:", err);
      throw new ApiError(
        err.message || "Không thể xóa member",
        err.statusCode || 500
      );
    }
  }

  /**
   * Rời nhóm (group chat only)
   * @param {number} chatId
   * @param {number} userId
   */
  async leaveGroup(chatId, userId) {
    const transaction = await sequelize.transaction();

    try {
      const chat = await Chat.findByPk(chatId, { transaction });
      if (!chat) throw new ApiError("Không tìm thấy chat", 404);

      // ⚠️ FIX: Chỉ cho rời group
      if (!chat.is_group) {
        throw new ApiError("Không thể rời khỏi chat 1-1", 400);
      }

      const deleted = await ChatMember.destroy({
        where: { chat_id: chatId, user_id: userId },
        transaction,
      });

      if (!deleted) throw new ApiError("User không ở trong nhóm", 404);

      // ⚠️ THÊM: Tạo system message
      // Tạo system message bằng cách lưu vào content
      const user = await User.findByPk(userId, {
        attributes: ["first_name", "last_name"],
      });

      await Message.create(
        {
          chat_id: chatId,
          sender_id: userId,
          content: `${user.first_name} ${user.last_name} đã rời khỏi nhóm`,
          type: "text",
          timestamp: new Date(),
        },
        { transaction }
      );

      // Check if there are any members left
      const remainingMembers = await ChatMember.count({
        where: { chat_id: chatId },
        transaction,
      });

      // If no members left, delete the chat and all related data
      if (remainingMembers === 0) {
        await Message.destroy({ where: { chat_id: chatId }, transaction });
        await MediaFile.destroy({ where: { chat_id: chatId }, transaction });
        await Chat.destroy({ where: { chat_id: chatId }, transaction });
      }

      await transaction.commit();

      return {
        success: true,
        message: "Bạn đã rời nhóm thành công",
      };
    } catch (err) {
      await transaction.rollback();
      console.error("leaveGroup error:", err);
      throw new ApiError(
        err.message || "Không thể rời nhóm",
        err.statusCode || 500
      );
    }
  }

  /**
   * Lấy danh sách media files trong chat
   * @param {number} chatId
   * @param {number} userId - User đang request
   * @param {string} type - 'image' | 'file' | 'all'
   */
  async getMediaFiles(chatId, userId, type = "all") {
    try {
      // ⚠️ THÊM: Check quyền
      const member = await ChatMember.findOne({
        where: { chat_id: chatId, user_id: userId },
      });

      if (!member) {
        throw new ApiError("Bạn không có quyền truy cập chat này", 403);
      }

      const whereClause = { chat_id: chatId };
      if (type !== "all") {
        whereClause.type = type; // Fixed: use 'type' not 'file_type'
      }

      const files = await MediaFile.findAll({
        where: whereClause,
        order: [["uploaded_at", "DESC"]],
      });

      // Format cho frontend
      return files.map((file) => ({
        media_file_id: file.media_file_id, // Fixed: correct field name
        chat_id: file.chat_id,
        url: file.url, // Fixed: correct field name
        name: file.file_name,
        type: file.type, // Fixed: correct field name
        timestamp: file.uploaded_at,
      }));
    } catch (err) {
      console.error("getMediaFiles error:", err);
      throw new ApiError(
        err.message || "Không thể lấy media files",
        err.statusCode || 500
      );
    }
  }

  /**
   * ⚠️ THÊM MỚI: Tạo chat mới
   * @param {object} data { name, isGroup, members, createdBy }
   */
  async createChat(data) {
    const transaction = await sequelize.transaction();

    try {
      const { name, isGroup, members, createdBy, chatColor } = data;

      // Validate
      if (isGroup && (!members || members.length < 2)) {
        throw new ApiError("Group chat cần ít nhất 2 thành viên", 400);
      }

      if (!isGroup && members.length !== 1) {
        throw new ApiError("1-1 chat chỉ được 1 người nhận", 400);
      }

      // Check 1-1 chat đã tồn tại chưa
      if (!isGroup) {
        // Tìm tất cả chat 1-1 mà createdBy tham gia
        const existingChats = await ChatMember.findAll({
          where: { user_id: createdBy },
          include: [
            {
              model: Chat,
              where: { is_group: false },
              required: true,
            },
          ],
        });

        // Check xem có chat nào chứa cả 2 users không
        for (const chatMember of existingChats) {
          const otherMember = await ChatMember.findOne({
            where: {
              chat_id: chatMember.chat_id,
              user_id: members[0],
            },
          });

          if (otherMember) {
            // Chat với user này đã tồn tại, trả về chat đó
            const existingChat = await this.getChatById(
              chatMember.chat_id,
              createdBy
            );
            return existingChat;
          }
        }
      }

      // Tạo chat
      const chatData = {
        name: isGroup ? name : `Chat 1-1`, // Chat 1-1 dùng tên generic, sẽ format ở FE
        is_group: isGroup,
        chat_color: chatColor || "#cb0404",
        created_by: createdBy,
        created_at: new Date(),
      };

      const chat = await Chat.create(chatData, { transaction });

      // Thêm members
      const allMembers = isGroup
        ? [createdBy, ...members]
        : [createdBy, members[0]];
      const uniqueMembers = [...new Set(allMembers)];

      await ChatMember.bulkCreate(
        uniqueMembers.map((userId) => ({
          chat_id: chat.chat_id,
          user_id: userId,
          joined_at: new Date(),
        })),
        { transaction }
      );

      // Tạo system message cho group
      if (isGroup) {
        const creator = await User.findByPk(createdBy, {
          attributes: ["first_name", "last_name"],
        });

        await Message.create(
          {
            chat_id: chat.chat_id,
            sender_id: createdBy,
            content: `${creator.first_name} ${creator.last_name} đã tạo nhóm`,
            type: "text",
            timestamp: new Date(),
          },
          { transaction }
        );
      }

      await transaction.commit();

      // Lấy lại chat với đầy đủ thông tin
      const fullChat = await this.getChatById(chat.chat_id, createdBy);
      return fullChat;
    } catch (err) {
      await transaction.rollback();
      console.error("createChat error:", err);
      throw new ApiError(
        err.message || "Không thể tạo chat",
        err.statusCode || 500
      );
    }
  }

  /**
   * ⚠️ THÊM MỚI: Thêm members vào group
   * @param {number} chatId
   * @param {array} userIds - Danh sách user_id cần thêm
   * @param {string} addedBy - User thực hiện thêm
   */
  async addMembersToGroup(chatId, userIds, addedBy) {
    const transaction = await sequelize.transaction();

    try {
      const chat = await Chat.findByPk(chatId, { transaction });
      if (!chat) throw new ApiError("Không tìm thấy chat", 404);

      if (!chat.is_group) {
        throw new ApiError("Chỉ có thể thêm member vào group chat", 400);
      }

      // Check quyền của người thêm
      const adderMember = await ChatMember.findOne({
        where: { chat_id: chatId, user_id: addedBy },
        transaction,
      });

      if (!adderMember) {
        throw new ApiError("Bạn không có quyền thêm member", 403);
      }

      // Thêm members mới
      const existingMembers = await ChatMember.findAll({
        where: { chat_id: chatId },
        attributes: ["user_id"],
        transaction,
      });

      const existingIds = existingMembers.map((m) => m.user_id);
      const newUserIds = userIds.filter((id) => !existingIds.includes(id));

      if (newUserIds.length === 0) {
        throw new ApiError("Tất cả user đã có trong nhóm", 400);
      }

      await ChatMember.bulkCreate(
        newUserIds.map((userId) => ({
          chat_id: chatId,
          user_id: userId,
          joined_at: new Date(),
        })),
        { transaction }
      );

      // Tạo system message
      const addedUsers = await User.findAll({
        where: { user_id: newUserIds },
        attributes: ["user_id", "first_name", "last_name"],
      });

      const addedNames = addedUsers
        .map((u) => `${u.first_name} ${u.last_name}`)
        .join(", ");

      const adder = await User.findByPk(addedBy, {
        attributes: ["first_name", "last_name"],
      });

      await Message.create(
        {
          chat_id: chatId,
          sender_id: addedBy,
          content: `${adder.first_name} ${adder.last_name} đã thêm ${addedNames} vào nhóm`,
          type: "text",
          timestamp: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      return {
        success: true,
        message: `Đã thêm ${newUserIds.length} thành viên`,
        addedMembers: addedUsers,
      };
    } catch (err) {
      await transaction.rollback();
      console.error("addMembersToGroup error:", err);
      throw new ApiError(
        err.message || "Không thể thêm member",
        err.statusCode || 500
      );
    }
  }

  /**
   * ⚠️ THÊM MỚI: Xóa member khỏi group
   * @param {number} chatId
   * @param {string} userId - User bị xóa
   * @param {string} removedBy - User thực hiện xóa
   */
  async removeMemberFromGroup(chatId, userId, removedBy) {
    const transaction = await sequelize.transaction();

    try {
      const chat = await Chat.findByPk(chatId, { transaction });
      if (!chat) throw new ApiError("Không tìm thấy chat", 404);

      if (!chat.is_group) {
        throw new ApiError("Chỉ có thể xóa member khỏi group chat", 400);
      }

      // Check quyền
      const removerMember = await ChatMember.findOne({
        where: { chat_id: chatId, user_id: removedBy },
        transaction,
      });

      if (!removerMember) {
        throw new ApiError("Bạn không có quyền xóa member", 403);
      }

      const deleted = await ChatMember.destroy({
        where: { chat_id: chatId, user_id: userId },
        transaction,
      });

      if (!deleted) {
        throw new ApiError("User không ở trong nhóm", 404);
      }

      // Tạo system message
      const removedUser = await User.findByPk(userId, {
        attributes: ["user_id", "first_name", "last_name"],
      });

      const remover = await User.findByPk(removedBy, {
        attributes: ["first_name", "last_name"],
      });

      await Message.create(
        {
          chat_id: chatId,
          sender_id: removedBy,
          content: `${remover.first_name} ${remover.last_name} đã xóa ${removedUser.first_name} ${removedUser.last_name} khỏi nhóm`,
          type: "text",
          timestamp: new Date(),
        },
        { transaction }
      );

      await transaction.commit();

      return {
        success: true,
        message: "Đã xóa thành viên khỏi nhóm",
      };
    } catch (err) {
      await transaction.rollback();
      console.error("removeMemberFromGroup error:", err);
      throw new ApiError(
        err.message || "Không thể xóa member",
        err.statusCode || 500
      );
    }
  }

  /**
   * ⚠️ THÊM MỚI: Lấy thông tin 1 chat
   * @param {number} chatId
   * @param {number} userId
   */
  async getChatById(chatId, userId) {
    try {
      const member = await ChatMember.findOne({
        where: { chat_id: chatId, user_id: userId },
      });

      if (!member) {
        throw new ApiError("Bạn không có quyền truy cập chat này", 403);
      }

      const chat = await Chat.findByPk(chatId, {
        include: [
          {
            model: User,
            as: "members",
            attributes: [
              "user_id",
              "first_name",
              "last_name",
              "avatar",
              "email",
            ],
            through: { attributes: [] },
          },
        ],
      });

      if (!chat) throw new ApiError("Không tìm thấy chat", 404);

      // Format tên và avatar cho chat 1-1
      let displayName = chat.name;
      let displayAvatar = chat.chat_avatar;

      if (!chat.is_group && chat.members.length === 2) {
        const otherUser = chat.members.find((m) => m.user_id !== userId);
        if (otherUser) {
          displayName =
            `${otherUser.first_name || ""} ${
              otherUser.last_name || ""
            }`.trim() || otherUser.email;
          displayAvatar = otherUser.avatar;
        }
      }

      return {
        chat_id: chat.chat_id,
        name: displayName,
        avatar: displayAvatar,
        is_group: chat.is_group,
        members: chat.members.map((m) => m.user_id),
        chat_color: chat.chat_color,
        memberDetails: chat.members,
        created_by: chat.created_by,
        created_at: chat.created_at,
      };
    } catch (err) {
      console.error("getChatById error:", err);
      throw new ApiError(
        err.message || "Không thể lấy thông tin chat",
        err.statusCode || 500
      );
    }
  }
}

module.exports = ChatService;
