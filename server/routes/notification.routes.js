const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const { protectRoute } = require("../controllers/auth.controller");

// All routes require authentication
router.use(protectRoute);

// Get all notifications for current user
router.get("/", notificationController.getNotifications);

// Get unread count
router.get("/unread-count", notificationController.getUnreadCount);

// Mark notification as read
router.patch("/:notificationId/read", notificationController.markAsRead);

// Mark all notifications as read
router.patch("/mark-all-read", notificationController.markAllAsRead);

// Delete notification
router.delete("/:notificationId", notificationController.deleteNotification);

module.exports = router;
