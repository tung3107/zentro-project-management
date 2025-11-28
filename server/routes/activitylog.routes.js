const express = require("express");
const router = express.Router();
const activityLogController = require("../controllers/activitylog.controller");
const { protectRoute } = require("../controllers/auth.controller");

// Define routes for activity log
router.get(
  "/:project_id",
  protectRoute,
  activityLogController.getActivityLogsForProject
);
router.get(
  "/:project_id/task/:task_id",
  protectRoute,
  activityLogController.getActivityLogForTask
);

module.exports = router;
