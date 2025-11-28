const notificationService = require("../services/notification.service");
const { catchAsync } = require("../utils/catchAsync");

const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user.user_id;
  const { limit = 50, offset = 0, unread_only = false } = req.query;

  const result = await notificationService.getUserNotifications(userId, {
    limit: parseInt(limit),
    offset: parseInt(offset),
    unreadOnly: unread_only === "true",
  });

  res.status(200).json({
    status: "success",
    data: result,
    message: "Notifications retrieved successfully",
  });
});

const getUnreadCount = catchAsync(async (req, res) => {
  const userId = req.user.user_id;
  const count = await notificationService.getUnreadCount(userId);

  res.status(200).json({
    status: "success",
    data: { count },
    message: "Unread count retrieved successfully",
  });
});

const markAsRead = catchAsync(async (req, res) => {
  const userId = req.user.user_id;
  const { notificationId } = req.params;

  const notification = await notificationService.markAsRead(
    notificationId,
    userId
  );

  res.status(200).json({
    status: "success",
    data: notification,
    message: "Notification marked as read",
  });
});

const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user.user_id;

  await notificationService.markAllAsRead(userId);

  res
    .status(200)
    .json({ status: "success", message: "All notifications marked as read" });
});

const deleteNotification = catchAsync(async (req, res) => {
  const userId = req.user.user_id;
  const { notificationId } = req.params;

  await notificationService.deleteNotification(notificationId, userId);

  res
    .status(200)
    .json({ status: "success", message: "Notification deleted successfully" });
});

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
