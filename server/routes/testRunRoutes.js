const express = require("express");
const router = express.Router();
const testRunController = require("../controllers/testRunController");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const upload = require("../middlewares/upload");

// All routes require authentication
router.use(protectRoute);

// Create a new test run
router.post("/projects/:projectId/test-runs", testRunController.createTestRun);

// Get all test runs for a project
router.get("/projects/:projectId/test-runs", testRunController.getTestRuns);

// Get test run detail
router.get("/test-runs/:runId", testRunController.getTestRunDetail);

// Update test run status (e.g. complete)
router.patch("/test-runs/:runId/status", testRunController.updateTestRunStatus);

// Update test case result in a run
router.patch(
  "/test-runs/:runId/testcases/:testcaseId",
  testRunController.updateTestCaseResult
);

// Update step result
router.patch(
  "/test-runs/:runId/testcases/:testcaseId/steps/:stepNumber",
  testRunController.updateStepResult
);

// Get steps for a test case in a run
router.get(
  "/test-runs/:runId/testcases/:testcaseId/steps",
  testRunController.getRunSteps
);

// Duplicate test run
router.post("/test-runs/:runId/duplicate", testRunController.duplicateTestRun);

// Update test run
router.put("/test-runs/:runId", testRunController.updateTestRun);

// Delete test run
router.delete("/test-runs/:runId", testRunController.deleteTestRun);

// Get test case history
router.get(
  "/test-runs/:runId/testcases/:testcaseId/history",
  testRunController.getTestCaseHistory
);

// Remove test case from run
router.delete(
  "/test-runs/:runId/testcases/:testcaseId",
  testRunController.removeTestCaseFromRun
);

// Bulk remove test cases from run
router.post(
  "/test-runs/:runId/bulk-remove",
  testRunController.bulkRemoveTestCases
);

// Bulk assign test cases
router.post(
  "/test-runs/:runId/bulk-assign",
  testRunController.bulkAssignTestCases
);

// Re-run test case
router.post(
  "/test-runs/:runId/testcases/:testcaseId/rerun",
  testRunController.rerunTestCase
);

// Upload test result images
router.post(
  "/test-runs/upload-images",
  upload.array("images", 10),
  testRunController.uploadTestResultImages
);

module.exports = router;
