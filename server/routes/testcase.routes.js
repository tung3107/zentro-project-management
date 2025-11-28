const express = require("express");
const routers = express.Router();
const upload = require("../middlewares/upload");
const {
  createTestCase,
  getTestCases,
  getTestCaseById,
  updateTestCase,
  deleteTestCase,
  getVersionHistory,
  uploadAttachment,
  deleteAttachment,
  getTestSuites,
  createTestSuite,
  updateTestSuite,
  deleteTestSuite,
  duplicateTestSuite,
  getSuiteChildren,
  getTestCasesByTask,
  getTestSuitesByTask,
  exportTestCases,
  importTestCases,
} = require("../controllers/testcase.controller");
const { protectRoute } = require("../controllers/auth.controller");

// ------------------------ TestCase routes ------------------------

// Create & List TestCases
routers
  .route("/projects/:projectId/testcases")
  .post(protectRoute, createTestCase)
  .get(protectRoute, getTestCases);

// Single TestCase CRUD
routers
  .route("/testcases/:testcaseId")
  .get(protectRoute, getTestCaseById)
  .put(protectRoute, updateTestCase)
  .delete(protectRoute, deleteTestCase);

// Version history
routers
  .route("/testcases/:testcaseId/versions")
  .get(protectRoute, getVersionHistory);

// Attachments
routers
  .route("/testcases/:testcaseId/attachments")
  .post(protectRoute, upload.single("file"), uploadAttachment);

routers
  .route("/testcases/attachments/:attachmentId")
  .delete(protectRoute, deleteAttachment);

// ------------------------ TestSuite routes ------------------------

// Create & List TestSuites
routers
  .route("/projects/:projectId/testsuites")
  .post(protectRoute, createTestSuite)
  .get(protectRoute, getTestSuites);

// Single TestSuite CRUD
routers
  .route("/testsuites/:suiteId")
  .put(protectRoute, updateTestSuite)
  .delete(protectRoute, deleteTestSuite);

// Duplicate TestSuite
routers
  .route("/testsuites/:suiteId/duplicate")
  .post(protectRoute, duplicateTestSuite);

// Check suite children
routers
  .route("/testsuites/:suiteId/children")
  .get(protectRoute, getSuiteChildren);

// ------------------------ Task relations ------------------------
routers.route("/tasks/:taskId/testcases").get(protectRoute, getTestCasesByTask);

routers
  .route("/tasks/:taskId/testsuites")
  .get(protectRoute, getTestSuitesByTask);

// ------------------------ Import / Export ------------------------
routers
  .route("/projects/:projectId/testcases/export")
  .get(protectRoute, exportTestCases);

routers
  .route("/projects/:projectId/testcases/import")
  .post(protectRoute, upload.single("file"), importTestCases);

module.exports = routers;
