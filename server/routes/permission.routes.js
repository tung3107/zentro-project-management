const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getOnePermission,
  getListOfPermissionByRole,
} = require("../controllers/permission.controller");

const routes = express.Router();

routes.route("/me").get(protectRoute, getListOfPermissionByRole);

// authorize("user", "read")

module.exports = routes;
