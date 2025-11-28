const Comment = require("../models/Comment");
const Task = require("../models/Task");
const User = require("../models/User");

const CommentMention = require("../models/CommentMention");
const CommentTaskMention = require("../models/CommentTaskMention");

const ApiError = require("../utils/ApiError");
const { sequelize } = require("../config/database");
const notificationService = require("./notification.service");

function extractMentionedUserIdsFromHtml(html) {
  // simple regex to find data-user="USER_ID" inside spans or tags
  const regex = /data-user=["']([^"']+)["']/g;
  const ids = new Set();
  let m;
  while ((m = regex.exec(html)) !== null) {
    ids.add(m[1]);
  }
  return Array.from(ids);
}

function extractTaskMentionsFromText(text) {
  // find @task-<alphanum or hyphen>
  const regex = /data-task-id=["']([^"']+)["']/g;
  const ids = new Set();
  let m;
  while ((m = regex.exec(text)) !== null) {
    ids.add(m[1]);
  }
  return Array.from(ids);
}

function textContentFromHtml(html) {
  // create a temp DOM parser (Node environment: can use regex fallback)
  return html.replace(/<[^>]+>/g, (tag) => {
    // if this is a mention span, keep its text content
    const m = tag.match(
      /<span[^>]*class=["']mention["'][^>]*data-user=["']([^"']+)["'][^>]*>/
    );
    if (m) return `@${m[1]}`; // fallback
    return " ";
  });
}

class CommentService {
  async getAllCommentByTask(task_id) {
    try {
      const task = await Task.findByPk(task_id);
      if (!task) throw new ApiError("Task not found", 400);

      const data = await Comment.findAll({
        where: { task_id: task_id },
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "first_name",
              "last_name",
              "email",
              "avatar",
            ],
          },
          {
            model: User,
            as: "mentionedUsers",
            required: false,
            attributes: [
              "user_id",
              "first_name",
              "last_name",
              "email",
              "avatar",
            ],
          },
          {
            model: Task,
            as: "mentionedTasks",
            required: false,
            attributes: ["task_id", "title"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      return data;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async postAComment(body, user_id) {
    try {
      const task = await Task.findByPk(body.task_id);
      if (!task) throw new ApiError("Task not found", 400);

      let notificationData = {
        mentionedUserIds: [],
        commentId: null,
        taskId: body.task_id,
        projectId: task.project_id,
        actorId: user_id,
      };

      const comment = await sequelize.transaction(async (t) => {
        const newComment = await Comment.create(
          {
            task_id: body.task_id,
            user_id,
            content: body.content,
          },
          { transaction: t }
        );

        notificationData.commentId = newComment.comment_id;

        const mentionedUserIds = extractMentionedUserIdsFromHtml(body.content);

        if (mentionedUserIds.length) {
          const users = await User.findAll({
            where: { user_id: mentionedUserIds },
            attributes: ["user_id"],
            transaction: t,
          });
          const existingUserIds = new Set(users.map((u) => u.user_id));

          for (const uid of existingUserIds) {
            await CommentMention.create(
              {
                comment_id: newComment.comment_id,
                mentioned_user_id: uid,
              },
              { transaction: t }
            );
          }

          notificationData.mentionedUserIds = Array.from(existingUserIds);
        }

        const plainText = body.content.replace(/<[^>]+>/g, " ");
        const taskIds = extractTaskMentionsFromText(plainText);

        if (taskIds.length) {
          const possibleTaskIds = taskIds.flatMap((id) => [id, `task-${id}`]);

          const tasks = await Task.findAll({
            where: { task_id: possibleTaskIds },
            attributes: ["task_id"],
            transaction: t,
          });
          const existingTaskIds = new Set(tasks.map((tr) => tr.task_id));

          for (const tid of existingTaskIds) {
            await CommentTaskMention.create(
              {
                comment_id: newComment.comment_id,
                mentioned_task_id: tid,
              },
              { transaction: t }
            );
          }
        }

        return newComment;
      });

      if (notificationData.mentionedUserIds.length > 0) {
        await Promise.all(
          notificationData.mentionedUserIds.map(async (uid) => {
            try {
              await notificationService.notifyCommentMention(
                notificationData.commentId,
                uid,
                notificationData.actorId,
                notificationData.taskId,
                notificationData.projectId
              );
            } catch (error) {
              console.error(`Error notifying user ${uid}:`, error);
            }
          })
        );
      }

      try {
        await notificationService.notifyCommentOnTask(
          notificationData.commentId,
          notificationData.taskId,
          notificationData.actorId,
          notificationData.projectId
        );
      } catch (error) {
        console.error("Error notifying task members:", error);
      }

      return comment;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async updateComment(comment_id, content, user_id) {
    try {
      const comment = await Comment.findByPk(comment_id);
      if (!comment) throw new ApiError("Comment not found", 404);

      if (comment.user_id !== user_id) {
        throw new ApiError(
          "You are not authorized to update this comment",
          403
        );
      }

      const task = await Task.findByPk(comment.task_id);
      if (!task) throw new ApiError("Task not found", 404);

      const oldMentions = await CommentMention.findAll({
        where: { comment_id },
        attributes: ["mentioned_user_id"],
      });
      const oldMentionedUserIds = new Set(
        oldMentions.map((m) => m.mentioned_user_id)
      );

      // ✅ Store notification data
      let notificationData = {
        newMentionedUserIds: [],
        commentId: comment_id,
        taskId: comment.task_id,
        projectId: task.project_id,
        actorId: user_id,
      };

      await sequelize.transaction(async (t) => {
        await comment.update({ content }, { transaction: t });

        await CommentMention.destroy({
          where: { comment_id },
          transaction: t,
        });
        await CommentTaskMention.destroy({
          where: { comment_id },
          transaction: t,
        });

        const mentionedUserIds = extractMentionedUserIdsFromHtml(content);
        if (mentionedUserIds.length) {
          const users = await User.findAll({
            where: { user_id: mentionedUserIds },
            attributes: ["user_id"],
            transaction: t,
          });
          const existingUserIds = new Set(users.map((u) => u.user_id));
          for (const uid of existingUserIds) {
            await CommentMention.create(
              {
                comment_id: comment.comment_id,
                mentioned_user_id: uid,
              },
              { transaction: t }
            );
          }

          // ✅ Store NEW mentions only
          notificationData.newMentionedUserIds = Array.from(
            existingUserIds
          ).filter((uid) => !oldMentionedUserIds.has(uid));
        }

        const plainText = content.replace(/<[^>]+>/g, " ");
        const taskIds = extractTaskMentionsFromText(plainText);
        if (taskIds.length) {
          const possibleTaskIds = taskIds.flatMap((id) => [id, `task-${id}`]);
          const tasks = await Task.findAll({
            where: { task_id: possibleTaskIds },
            attributes: ["task_id"],
            transaction: t,
          });
          const existingTaskIds = new Set(tasks.map((tr) => tr.task_id));
          for (const tid of existingTaskIds) {
            await CommentTaskMention.create(
              {
                comment_id: comment.comment_id,
                mentioned_task_id: tid,
              },
              { transaction: t }
            );
          }
        }
      });

      // ✅ Send notifications AFTER transaction
      if (notificationData.newMentionedUserIds.length > 0) {
        await Promise.all(
          notificationData.newMentionedUserIds.map(async (uid) => {
            try {
              await notificationService.notifyCommentMention(
                notificationData.commentId,
                uid,
                notificationData.actorId,
                notificationData.taskId,
                notificationData.projectId
              );
            } catch (error) {
              console.error(`Error notifying ${uid}:`, error);
            }
          })
        );
      }

      return comment;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async deleteComment(comment_id, user_id) {
    try {
      const comment = await Comment.findByPk(comment_id);
      if (!comment) throw new ApiError("Comment not found", 404);

      // Verify ownership
      if (comment.user_id !== user_id) {
        throw new ApiError(
          "You are not authorized to delete this comment",
          403
        );
      }

      return sequelize.transaction(async (t) => {
        // Delete mentions first
        await CommentMention.destroy({
          where: { comment_id },
          transaction: t,
        });
        await CommentTaskMention.destroy({
          where: { comment_id },
          transaction: t,
        });

        // Delete comment
        await comment.destroy({ transaction: t });
      });
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }
}

module.exports = CommentService;
