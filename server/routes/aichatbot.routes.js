const express = require("express");
const {
  createAIChatForProject,
  sendAIMessage,
  getProjectContext,
  generateTaskDescription,
  generateTaskSummary,
} = require("../controllers/aichatbot.controller");
const { protectRoute } = require("../controllers/auth.controller");

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(protectRoute);

// AI Chat routes
router.route("/:projectId").post(createAIChatForProject);

router.route("/:projectId/message").post(sendAIMessage);

router.route("/:projectId/context").get(getProjectContext);

// AI Task Description & Summary routes
router.route("/:projectId/generate-description").post(generateTaskDescription);

router.route("/:projectId/task/:taskId/summary").post(generateTaskSummary);

module.exports = router;
