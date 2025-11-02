const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getCurrentSprintDetails,
  createSprint_planned_status,
  startSprint,
  updateSprint,
  deleteSprint,
  getOneSprint,
  getAllSprints,
} = require("../controllers/sprint.controller");

const routes = express.Router();

routes
  .route("/:sprint_id")
  .delete(protectRoute, deleteSprint)
  .put(protectRoute, updateSprint)
  .get(protectRoute, getOneSprint);

routes
  .route("/current-sprint/:project_id")
  .get(protectRoute, getCurrentSprintDetails);

routes.route("/project/:project_id").get(protectRoute, getAllSprints);

routes
  .route("/create-planned-sprint")
  .post(protectRoute, createSprint_planned_status);

routes.route("/start-sprint/:sprint_id").post(protectRoute, startSprint);

module.exports = routes;
