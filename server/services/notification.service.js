const Notification = require("../models/Notification");
const User = require("../models/User");
const Task = require("../models/Task");
const Sprint = require("../models/Sprint");
const Comment = require("../models/Comment");
const Project = require("../models/Project");
const { getIO, getUserSocket } = require("../socket");
const { Op } = require("sequelize");

class NotificationService {
  /**
   * Create a new notification
   */
  async createNotification(data) {
    const notification = await Notification.create(data);

    // Fetch notification with related data
    const fullNotification = await this.getNotificationById(
      notification.notification_id
    );

    // Emit real-time notification to user via socket
    this.emitNotificationToUser(data.user_id, fullNotification);

    return fullNotification;
  }

  /**
   * Get notification by ID with all relations
   */
  async getNotificationById(notificationId) {
    return await Notification.findByPk(notificationId, {
      include: [
        {
          model: User,
          as: "actor",
          attributes: ["user_id", "first_name", "last_name", "avatar", "email"],
        },
        {
          model: Task,
          as: "task",
          attributes: ["task_id", "title", "type"],
        },
        {
          model: Sprint,
          as: "sprint",
          attributes: ["sprint_id", "name", "status"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["project_id", "project_name"],
        },
      ],
    });
  }

  /**
   * Get all notifications for a user
   */
  async getUserNotifications(
    userId,
    { limit = 50, offset = 0, unreadOnly = false } = {}
  ) {
    const where = { user_id: userId };
    if (unreadOnly) {
      where.is_read = false;
    }

    const notifications = await Notification.findAndCountAll({
      where,
      limit,
      offset,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          as: "actor",
          attributes: ["user_id", "first_name", "last_name", "avatar", "email"],
        },
        {
          model: Task,
          as: "task",
          attributes: ["task_id", "title", "type"],
        },
        {
          model: Sprint,
          as: "sprint",
          attributes: ["sprint_id", "name", "status"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["project_id", "project_name"],
        },
      ],
    });

    return notifications;
  }

  /**
   * Get unread count for a user
   */
  async getUnreadCount(userId) {
    return await Notification.count({
      where: {
        user_id: userId,
        is_read: false,
      },
    });
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    const notification = await Notification.findOne({
      where: {
        notification_id: notificationId,
        user_id: userId,
      },
    });

    if (!notification) {
      throw new Error("Notification not found");
    }

    notification.is_read = true;
    await notification.save();

    return notification;
  }

  /**
   * Mark all notifications as read for a user
   */
  async markAllAsRead(userId) {
    await Notification.update(
      { is_read: true },
      {
        where: {
          user_id: userId,
          is_read: false,
        },
      }
    );

    return { success: true };
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId, userId) {
    const result = await Notification.destroy({
      where: {
        notification_id: notificationId,
        user_id: userId,
      },
    });

    if (result === 0) {
      throw new Error("Notification not found");
    }

    return { success: true };
  }

  /**
   * Emit notification to user via socket
   */
  emitNotificationToUser(userId, notification) {
    try {
      const io = getIO();
      const socketId = getUserSocket(userId);

      if (socketId) {
        io.to(socketId).emit("new_notification", notification);
      }
    } catch (error) {
      console.error("Error emitting notification:", error);
    }
  }

  /**
   * Create notification for task assignment
   */
  async notifyTaskAssigned(taskId, assigneeId, actorId, projectId) {
    if (!assigneeId || assigneeId === actorId) return null;

    const task = await Task.findByPk(taskId);
    if (!task) return null;

    const actor = await User.findByPk(actorId);
    const actorName = actor
      ? `${actor.first_name} ${actor.last_name}`
      : "Someone";

    return await this.createNotification({
      user_id: assigneeId,
      type: "task_assigned",
      title: "Bạn được giao task mới",
      message: `${actorName} đã giao task "${task.title}" cho bạn`,
      task_id: taskId,
      project_id: projectId,
      actor_id: actorId,
      link: `/member/projects/${projectId}/backlog?task=${taskId}`,
    });
  }

  /**
   * Create notification for comment mention
   */
  async notifyCommentMention(
    commentId,
    mentionedUserId,
    actorId,
    taskId,
    projectId
  ) {
    if (!mentionedUserId || mentionedUserId === actorId) return null;

    const comment = await Comment.findByPk(commentId);
    const task = await Task.findByPk(taskId);
    if (!comment || !task) return null;

    const actor = await User.findByPk(actorId);
    const actorName = actor
      ? `${actor.first_name} ${actor.last_name}`
      : "Someone";

    return await this.createNotification({
      user_id: mentionedUserId,
      type: "comment_mention",
      title: "Bạn được mention trong comment",
      message: `${actorName} đã mention bạn trong comment của task "${task.title}"`,
      task_id: taskId,
      comment_id: commentId,
      project_id: projectId,
      actor_id: actorId,
      link: `/member/projects/${projectId}/backlog?task=${taskId}`,
    });
  }

  /**
   * Create notification for comment on assigned/reported task
   */
  async notifyCommentOnTask(commentId, taskId, actorId, projectId) {
    const task = await Task.findByPk(taskId);
    if (!task) return null;

    const actor = await User.findByPk(actorId);
    const actorName = actor
      ? `${actor.first_name} ${actor.last_name}`
      : "Someone";

    // Notify assignee and reporter (if different from actor)
    const recipientIds = [task.assignee_id, task.reporter_id].filter(
      (id) => id && id !== actorId
    );

    const uniqueRecipientIds = [...new Set(recipientIds)];

    const notifications = [];
    for (const recipientId of uniqueRecipientIds) {
      const notification = await this.createNotification({
        user_id: recipientId,
        type: "comment_on_task",
        title: "Comment mới trong task của bạn",
        message: `${actorName} đã comment trong task "${task.title}"`,
        task_id: taskId,
        comment_id: commentId,
        project_id: projectId,
        actor_id: actorId,
        link: `/member/projects/${projectId}/backlog?task=${taskId}`,
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Create notification for sprint start
   */
  async notifySprintStarted(sprintId, projectId, actorId) {
    const sprint = await Sprint.findByPk(sprintId);
    if (!sprint) return null;

    const actor = await User.findByPk(actorId);
    const actorName = actor
      ? `${actor.first_name} ${actor.last_name}`
      : "Someone";

    // Get all project members
    const Member = require("../models/Member");
    const members = await Member.findAll({
      where: { project_id: projectId },
      attributes: ["user_id"],
    });

    const notifications = [];
    for (const member of members) {
      if (member.user_id === actorId) continue;

      const notification = await this.createNotification({
        user_id: member.user_id,
        type: "sprint_started",
        title: "Sprint đã bắt đầu",
        message: `${actorName} đã bắt đầu sprint "${sprint.name}"`,
        sprint_id: sprintId,
        project_id: projectId,
        actor_id: actorId,
        link: `/member/projects/${projectId}/backlog`,
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Create notification for sprint completion
   */
  async notifySprintCompleted(sprintId, projectId, actorId) {
    const sprint = await Sprint.findByPk(sprintId);
    if (!sprint) return null;

    const actor = await User.findByPk(actorId);
    const actorName = actor
      ? `${actor.first_name} ${actor.last_name}`
      : "Someone";

    // Get all project members
    const Member = require("../models/Member");
    const members = await Member.findAll({
      where: { project_id: projectId },
      attributes: ["user_id"],
    });

    const notifications = [];
    for (const member of members) {
      if (member.user_id === actorId) continue;

      const notification = await this.createNotification({
        user_id: member.user_id,
        type: "sprint_completed",
        title: "Sprint đã hoàn thành",
        message: `${actorName} đã hoàn thành sprint "${sprint.name}"`,
        sprint_id: sprintId,
        project_id: projectId,
        actor_id: actorId,
        link: `/member/projects/${projectId}/backlog`,
      });
      notifications.push(notification);
    }

    return notifications;
  }

  /**
   * Create notification for test case assignment
   */
  async notifyTestCaseAssigned(
    runId,
    testcaseId,
    assigneeId,
    actorId,
    projectId
  ) {
    if (!assigneeId || assigneeId === actorId) return null;

    const TestCase = require("../models/TestCase");
    const TestRun = require("../models/TestRun");

    const testCase = await TestCase.findByPk(testcaseId);
    const testRun = await TestRun.findByPk(runId);
    if (!testCase || !testRun) return null;

    const actor = await User.findByPk(actorId);
    const actorName = actor
      ? `${actor.first_name} ${actor.last_name}`
      : "Someone";

    return await this.createNotification({
      user_id: assigneeId,
      type: "testcase_assigned",
      title: "Bạn được giao test case",
      message: `${actorName} đã giao test case "${testCase.name}" cho bạn trong test run "${testRun.name}"`,
      project_id: projectId,
      actor_id: actorId,
      link: `/member/projects/${projectId}/qa?runId=${runId}`,
    });
  }
}

module.exports = new NotificationService();
