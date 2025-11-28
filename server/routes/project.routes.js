const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getAllProjectsWithParam,
  getOneProject,
  updateOneProject,
  deleteOneProject,
  getProjectListByUser,
  createOneProject,
  getProjectStats,
  getProjectSummary,
} = require("../controllers/project.controller");
const upload = require("../middlewares/upload");

const routes = express.Router();

routes.route("/project-stats").get(protectRoute, getProjectStats);

routes
  .route("/get-project-by-user/:user_id")
  .get(protectRoute, getProjectListByUser);

routes.route("/:project_id/summary").get(protectRoute, getProjectSummary);

routes
  .route("/")
  .get(protectRoute, authorize("project", "read"), getAllProjectsWithParam)
  .post(protectRoute, upload.single("avatar"), createOneProject);

routes
  .route("/:project_id")
  .get(protectRoute, getOneProject)
  .put(
    protectRoute,
    authorize("project", "update"),
    upload.single("avatar"),
    updateOneProject
  )
  .delete(protectRoute, authorize("project", "delete"), deleteOneProject);

// authorize("project", "read"),

module.exports = routes;
