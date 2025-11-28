const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getOnePermission,
  getListOfPermissionByRole,
  getListOfPermissionByResource,
} = require("../controllers/permission.controller");
const {
  getProjectRole,
  getAllProjectsWithRolePermissions,
  updateProjectRolePermissions,
} = require("../controllers/projectrole.controller");

const routes = express.Router();

routes.route("/project/all-permission").get(protectRoute, getProjectRole);

routes
  .route("/project/admin-matrix")
  .get(protectRoute, getAllProjectsWithRolePermissions)
  .put(protectRoute, updateProjectRolePermissions);

routes.route("/me").get(protectRoute, getListOfPermissionByRole);

routes.route("/project").get(getListOfPermissionByResource);

// authorize("user", "read")

module.exports = routes;
