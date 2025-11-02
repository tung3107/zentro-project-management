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
} = require("../controllers/task.controller");

const routes = express.Router();

routes.route("/:project_id/sprints/").get(protectRoute, getTaskForBoard);

routes
  .route("/:project_id/sprints/search")
  .get(protectRoute, searchTaskForBoard);

routes.route("/:project_id/burndown").get(protectRoute, getBurndownChart);

routes.route("/:project_id/calendar").get(protectRoute, getTasksByMonth);

routes
  .route("/:task_id")
  .get(protectRoute, getOneTask)
  .put(protectRoute, updateOneTask)
  .delete(protectRoute, deleteOneTask);

routes.route("/backlog/:project_id").get(protectRoute, getBackLog_TaskBySprint);

routes
  .route("/backlog/search/:project_id")
  .get(protectRoute, searchTaskBackLog);

routes.route("/").post(protectRoute, createTask);

module.exports = routes;
