const express = require("express");
const { protectRoute } = require("../controllers/auth.controller");
const { getProjectStatus } = require("../controllers/status.controller");

const routes = express.Router();

routes.route("/:project_id").get(protectRoute, getProjectStatus);

module.exports = routes;
