const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  getMembersByProject,
  updateMemberOfProject,
  createMemberByProject,
} = require("../controllers/member.controller");

const routes = express.Router();

routes.route("/:project_id").get(protectRoute, getMembersByProject);

routes
  .route("/")
  .put(protectRoute, updateMemberOfProject)
  .post(protectRoute, createMemberByProject);

module.exports = routes;
