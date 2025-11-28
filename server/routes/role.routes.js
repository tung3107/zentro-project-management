const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getRoleForSystem,
  getRoleDropDownForProject,
  getAllProjectRole,
  createProjectRole,
  updateProjectRole,
  deleteProjectRole,
} = require("../controllers/role.controller");

const routes = express.Router();

routes.route("/project").get(protectRoute, getRoleDropDownForProject);

routes.route("/project-role").get(getAllProjectRole);

routes
  .route("/")
  .post(protectRoute, createProjectRole)
  .put(protectRoute, updateProjectRole);

routes
  .route("/system")
  .get(
    protectRoute,
    authorize("user", "update"),
    authorize("user", "create"),
    getRoleForSystem
  );

routes.route("/:role_id").delete(protectRoute, deleteProjectRole);

module.exports = routes;
