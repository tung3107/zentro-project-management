const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getOneTask,
  getBackLog_TaskBySprint,
  createTask,
  updateOneTask,
  searchTaskBackLog,
  deleteOneTask,
  getTaskForBoard,
  searchTaskForBoard,
  getBurndownChart,
  getTasksByMonth,
  getTasksForListView,
  searchTasksForMention,
  createTaskLink,
  deleteTaskLink,
} = require("../controllers/task.controller");

const routes = express.Router();

// Board-related
routes.route("/:project_id/sprints/").get(protectRoute, getTaskForBoard);
routes
  .route("/:project_id/sprints/search")
  .get(protectRoute, searchTaskForBoard);

// Charts & Calendar
routes.route("/:project_id/burndown").get(protectRoute, getBurndownChart);
routes.route("/:project_id/calendar").get(protectRoute, getTasksByMonth);

// List view
routes.route("/list/:project_id").get(protectRoute, getTasksForListView);

// Mention search
routes
  .route("/search/mention/:project_id")
  .get(protectRoute, searchTasksForMention);

// Backlog
routes.route("/backlog/:project_id").get(protectRoute, getBackLog_TaskBySprint);
routes
  .route("/backlog/search/:project_id")
  .get(protectRoute, searchTaskBackLog);

// Create Task
routes.route("/").post(protectRoute, createTask);

// Task Link
routes.route("/:task_id/link").post(protectRoute, createTaskLink);
routes.route("/:task_id/link").delete(protectRoute, deleteTaskLink);

// Dynamic task_id — ALWAYS LAST
routes
  .route("/:task_id")
  .get(protectRoute, getOneTask)
  .put(protectRoute, updateOneTask)
  .delete(protectRoute, deleteOneTask);

module.exports = routes;
