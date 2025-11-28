const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  generateReport,
  getAvailableProjects,
  getTeamMembers,
  exportReportToPDF,
  sendReportEmail,
  getReportHistory,
} = require("../controllers/report.controller");

const routes = express.Router();

// Get available projects for filtering
routes.route("/projects").get(protectRoute, getAvailableProjects);

// Get team members for a specific project
routes.route("/team-members/:projectId").get(protectRoute, getTeamMembers);

// Get report history for a project
routes.route("/history/:projectId").get(protectRoute, getReportHistory);

// Generate report
routes.route("/generate").post(protectRoute, generateReport);

// Export report to PDF
routes.route("/export-pdf").post(protectRoute, exportReportToPDF);

// Send report via email
routes.route("/send-email").post(protectRoute, sendReportEmail);

module.exports = routes;
