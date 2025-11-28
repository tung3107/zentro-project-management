const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getCurrentSprintDetails,
  createSprint_planned_status,
  startSprint,
  updateSprint,
  deleteSprint,
  completeSprint,
  getOneSprint,
  getAllSprints,
  checkCompleteSprint,
} = require("../controllers/sprint.controller");

const routes = express.Router();

routes
  .route("/current-sprint/:project_id")
  .get(protectRoute, getCurrentSprintDetails);

routes.route("/project/:project_id").get(protectRoute, getAllSprints);

routes
  .route("/create-planned-sprint")
  .post(protectRoute, createSprint_planned_status);

routes.route("/start-sprint/:sprint_id").post(protectRoute, startSprint);

routes.route("/complete-sprint/:sprint_id").post(protectRoute, completeSprint);

routes
  .route("/check-complete-sprint/:sprint_id")
  .get(protectRoute, checkCompleteSprint);

routes
  .route("/:sprint_id")
  .delete(protectRoute, deleteSprint)
  .put(protectRoute, updateSprint)
  .get(protectRoute, getOneSprint);

module.exports = routes;
