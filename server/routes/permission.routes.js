const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getOnePermission,
  getListOfPermissionByRole,
  getListOfPermissionByResource,
} = require("../controllers/permission.controller");

const routes = express.Router();

routes.route("/me").get(protectRoute, getListOfPermissionByRole);

routes.route("/project").get(getListOfPermissionByResource);

// authorize("user", "read")

module.exports = routes;
