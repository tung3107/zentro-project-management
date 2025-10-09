const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getAllProjectsWithParam,
  getOneProject,
  updateOneProject,
  deleteOneProject,
  getProjectListByUser,
  createOneProject,
} = require("../controllers/project.controller");
const upload = require("../middlewares/upload");

const routes = express.Router();

routes
  .route("/")
  .get(protectRoute, authorize("project", "read"), getAllProjectsWithParam)
  .post(protectRoute, upload.single("avatar"), createOneProject);

routes
  .route("/:project_id")
  .get(protectRoute, authorize("project", "read"), getOneProject)
  .put(
    protectRoute,
    authorize("project", "update"),
    upload.single("avatar"),
    updateOneProject
  )
  .delete(protectRoute, authorize("project", "delete"), deleteOneProject);

routes
  .route("/get-project-by-user/:user_id")
  .get(protectRoute, getProjectListByUser);

module.exports = routes;
