const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getOneTask,
  getBackLog_TaskBySprint,
  createTask,
  updateOneTask,
  searchTaskBackLog,
} = require("../controllers/task.controller");

const routes = express.Router();

routes
  .route("/:task_id")
  .get(protectRoute, getOneTask)
  .put(protectRoute, updateOneTask);

routes.route("/backlog/:project_id").get(protectRoute, getBackLog_TaskBySprint);

routes
  .route("/backlog/search/:project_id")
  .get(protectRoute, searchTaskBackLog);

routes.route("/").post(protectRoute, createTask);

module.exports = routes;
