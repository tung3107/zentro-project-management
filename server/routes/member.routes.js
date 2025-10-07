const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getMembersByProject,
  updateMemberOfProject,
} = require("../controllers/member.controller");

const routes = express.Router();

routes.route("/:project_id").get(protectRoute, getMembersByProject);

routes.route("/").put(protectRoute, updateMemberOfProject);

module.exports = routes;
