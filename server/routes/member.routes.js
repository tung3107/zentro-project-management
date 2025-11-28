const express = require("express");
const {
  protectRoute,
  authorize,
  authorizeProject,
} = require("../controllers/auth.controller");
const {
  getMembersByProject,
  updateMemberOfProject,
  createMemberByProject,
  getMembersByProject_fordropdown,
  searchMembersByProject,
  getAvailableUsers,
  checkMemberPermission,
} = require("../controllers/member.controller");

const routes = express.Router();

routes
  .route("/dropdown/:project_id")
  .get(protectRoute, getMembersByProject_fordropdown);

routes.route("/search/:project_id").get(protectRoute, searchMembersByProject);

routes.route("/available/:project_id").get(protectRoute, getAvailableUsers);

// Check permission route
routes
  .route("/permission/:project_id")
  .get(protectRoute, checkMemberPermission);

// Write routes - require 'manage_members' permission on 'member' resource
routes
  .route("/")
  .put(
    protectRoute,
    authorizeProject("member", "manage_members"),
    updateMemberOfProject
  )
  .post(
    protectRoute,
    authorizeProject("member", "manage_members"),
    createMemberByProject
  );

// Read routes - allow anyone with 'read' permission on 'member' resource
routes.route("/:project_id").get(protectRoute, getMembersByProject);

module.exports = routes;
