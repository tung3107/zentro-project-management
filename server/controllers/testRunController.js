const TestRun = require("../models/TestRun");
const TestRunTestCase = require("../models/TestRunTestCase");
const TestRunStep = require("../models/TestRunStep");
const TestSuite = require("../models/TestSuite");

const TestCase = require("../models/TestCase");
const User = require("../models/User");
const { sequelize } = require("../config/database");
const TestRunHistory = require("../models/TestRunHistory");
const { uploadImg } = require("../utils/uploadImg");

// Create a new Test Run
exports.createTestRun = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { projectId } = req.params;
    const { name, description, testcaseIds } = req.body;
    const userId = req.user.user_id;

    // 1. Create Test Run
    const testRun = await TestRun.create(
      {
        project_id: projectId,
        name,
        description,
        created_by: userId,
        status: "active",
      },
      { transaction }
    );

    // 2. Link Test Cases
    if (testcaseIds && testcaseIds.length > 0) {
      const testRunTestCases = testcaseIds.map((id) => ({
        test_run_id: testRun.test_run_id,
        testcase_id: id,
        status: "untested",
      }));
      await TestRunTestCase.bulkCreate(testRunTestCases, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ success: true, data: testRun });
  } catch (error) {
    await transaction.rollback();
    console.error("Create Test Run Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create test run" });
  }
};

// Get all Test Runs for a project
exports.getTestRuns = async (req, res) => {
  try {
    const { projectId } = req.params;
    const testRuns = await TestRun.findAll({
      where: { project_id: projectId },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["user_id", "first_name", "last_name", "avatar"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Calculate stats for each run (optional optimization: do this in DB query)
    const runsWithStats = await Promise.all(
      testRuns.map(async (run) => {
        const total = await TestRunTestCase.count({
          where: { test_run_id: run.test_run_id },
        });
        const passed = await TestRunTestCase.count({
          where: { test_run_id: run.test_run_id, status: "passed" },
        });
        const failed = await TestRunTestCase.count({
          where: { test_run_id: run.test_run_id, status: "failed" },
        });
        return { ...run.toJSON(), stats: { total, passed, failed } };
      })
    );

    res.status(200).json({ success: true, data: runsWithStats });
  } catch (error) {
    console.error("Get Test Runs Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get test runs" });
  }
};

// Get Test Run Detail
exports.getTestRunDetail = async (req, res) => {
  try {
    const { runId } = req.params;
    const testRun = await TestRun.findByPk(runId, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["user_id", "first_name", "last_name", "avatar"],
        },
      ],
    });

    if (!testRun) {
      return res
        .status(404)
        .json({ success: false, message: "Test run not found" });
    }

    const testCases = await TestRunTestCase.findAll({
      where: { test_run_id: runId },
      include: [
        {
          model: TestCase,
          as: "testcase",
          include: [{ model: TestSuite, as: "suite" }],
        },
        {
          model: User,
          as: "assignee",
          attributes: ["user_id", "first_name", "last_name", "avatar"],
        },
        {
          model: User,
          as: "executor",
          attributes: ["user_id", "first_name", "last_name", "avatar"],
        },
      ],
    });

    res
      .status(200)
      .json({ success: true, data: { ...testRun.toJSON(), testCases } });
  } catch (error) {
    console.error("Get Test Run Detail Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get test run detail" });
  }
};

// Update Test Run Status (e.g., Complete)
exports.updateTestRunStatus = async (req, res) => {
  try {
    const { runId } = req.params;
    const { status } = req.body;

    const testRun = await TestRun.findByPk(runId);
    if (!testRun) {
      return res
        .status(404)
        .json({ success: false, message: "Test run not found" });
    }

    testRun.status = status;
    if (status === "completed") {
      testRun.completed_at = new Date();
    }
    await testRun.save();

    res.status(200).json({ success: true, data: testRun });
  } catch (error) {
    console.error("Update Test Run Status Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update test run status" });
  }
};

// Update Test Case Result in Run
exports.updateTestCaseResult = async (req, res) => {
  try {
    const { runId, testcaseId } = req.params;
    const { status, assigned_to, note, image_urls } = req.body;
    const userId = req.user.user_id;

    const runTestCase = await TestRunTestCase.findOne({
      where: { test_run_id: runId, testcase_id: testcaseId },
    });

    if (!runTestCase) {
      return res
        .status(404)
        .json({ success: false, message: "Test case not found in this run" });
    }

    // // Check if test case is locked (passed)
    // if (runTestCase.is_locked && status && status !== runTestCase.status) {
    //   return res
    //     .status(403)
    //     .json({
    //       success: false,
    //       message:
    //         "Cannot modify a locked test case. Use re-run to test again.",
    //     });
    // }

    // If status is changing, create a history entry
    if (status && status !== runTestCase.status) {
      await TestRunHistory.create({
        test_run_testcase_id: runTestCase.id,
        status,
        executed_by: userId,
        note: note || null,
        image_urls: image_urls || null,
      });

      runTestCase.status = status;
      runTestCase.executed_by = userId;
      runTestCase.executed_at = new Date();

      // Lock the test case if status is 'passed'
      if (status === "passed") {
        runTestCase.is_locked = true;
      }
    }

    // Handle assignment and send notification
    if (assigned_to !== undefined && assigned_to !== runTestCase.assigned_to) {
      runTestCase.assigned_to = assigned_to;

      if (assigned_to) {
        const notificationService = require("../services/notification.service");
        const testRun = await TestRun.findByPk(runId);
        await notificationService.notifyTestCaseAssigned(
          runId,
          testcaseId,
          assigned_to,
          userId,
          testRun.project_id
        );
      }
    }

    if (note !== undefined) runTestCase.note = note;
    if (image_urls !== undefined) runTestCase.image_urls = image_urls;

    await runTestCase.save();

    res.status(200).json({ success: true, data: runTestCase });
  } catch (error) {
    console.error("Update Test Case Result Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update test case result" });
  }
};

// Update Step Result
exports.updateStepResult = async (req, res) => {
  try {
    const { runId, testcaseId, stepNumber } = req.params;
    const { status, actual_result, evidence_url } = req.body;

    // Find the TestRunTestCase ID first
    const runTestCase = await TestRunTestCase.findOne({
      where: { test_run_id: runId, testcase_id: testcaseId },
    });

    if (!runTestCase) {
      return res
        .status(404)
        .json({ success: false, message: "Test case not found in this run" });
    }

    // Find or Create the Step Record
    let step = await TestRunStep.findOne({
      where: { test_run_testcase_id: runTestCase.id, step_number: stepNumber },
    });

    if (!step) {
      step = await TestRunStep.create({
        test_run_testcase_id: runTestCase.id,
        step_number: stepNumber,
        status: status || "untested",
        actual_result,
        evidence_url,
      });
    } else {
      if (status) step.status = status;
      if (actual_result !== undefined) step.actual_result = actual_result;
      if (evidence_url !== undefined) step.evidence_url = evidence_url;
      await step.save();
    }

    res.status(200).json({ success: true, data: step });
  } catch (error) {
    console.error("Update Step Result Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update step result" });
  }
};

// Get Steps for a Run Test Case
exports.getRunSteps = async (req, res) => {
  try {
    const { runId, testcaseId } = req.params;

    const runTestCase = await TestRunTestCase.findOne({
      where: { test_run_id: runId, testcase_id: testcaseId },
    });

    if (!runTestCase) {
      return res
        .status(404)
        .json({ success: false, message: "Test case not found in this run" });
    }

    const steps = await TestRunStep.findAll({
      where: { test_run_testcase_id: runTestCase.id },
      order: [["step_number", "ASC"]],
    });

    res.status(200).json({ success: true, data: steps });
  } catch (error) {
    console.error("Get Run Steps Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get run steps" });
  }
};

// Duplicate Test Run
exports.duplicateTestRun = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { runId } = req.params;
    const userId = req.user.user_id;

    // Get original test run
    const originalRun = await TestRun.findByPk(runId);
    if (!originalRun) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Test run not found" });
    }

    // Create duplicate test run
    const duplicateRun = await TestRun.create(
      {
        project_id: originalRun.project_id,
        name: `${originalRun.name} (Copy)`,
        description: originalRun.description,
        created_by: userId,
        status: "active",
      },
      { transaction }
    );

    // Copy test cases
    const originalTestCases = await TestRunTestCase.findAll({
      where: { test_run_id: runId },
    });

    if (originalTestCases.length > 0) {
      const duplicateTestCases = originalTestCases.map((tc) => ({
        test_run_id: duplicateRun.test_run_id,
        testcase_id: tc.testcase_id,
        status: "untested", // Reset status
      }));
      await TestRunTestCase.bulkCreate(duplicateTestCases, { transaction });
    }

    await transaction.commit();
    res.status(201).json({ success: true, data: duplicateRun });
  } catch (error) {
    await transaction.rollback();
    console.error("Duplicate Test Run Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to duplicate test run" });
  }
};

// Update Test Run
exports.updateTestRun = async (req, res) => {
  try {
    const { runId } = req.params;
    const { name, description } = req.body;

    const testRun = await TestRun.findByPk(runId);
    if (!testRun) {
      return res
        .status(404)
        .json({ success: false, message: "Test run not found" });
    }

    if (name !== undefined) testRun.name = name;
    if (description !== undefined) testRun.description = description;

    await testRun.save();
    res.status(200).json({ success: true, data: testRun });
  } catch (error) {
    console.error("Update Test Run Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to update test run" });
  }
};

// Delete Test Run
exports.deleteTestRun = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { runId } = req.params;

    const testRun = await TestRun.findByPk(runId);
    if (!testRun) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Test run not found" });
    }

    // Delete associated test run test cases and steps
    const testRunTestCases = await TestRunTestCase.findAll({
      where: { test_run_id: runId },
    });

    for (const tc of testRunTestCases) {
      await TestRunStep.destroy({
        where: { test_run_testcase_id: tc.id },
        transaction,
      });
    }

    await TestRunTestCase.destroy({
      where: { test_run_id: runId },
      transaction,
    });
    await testRun.destroy({ transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ success: true, message: "Test run deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Delete Test Run Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to delete test run" });
  }
};
// Get Test Case History
exports.getTestCaseHistory = async (req, res) => {
  try {
    const { runId, testcaseId } = req.params;

    const runTestCase = await TestRunTestCase.findOne({
      where: { test_run_id: runId, testcase_id: testcaseId },
    });

    if (!runTestCase) {
      return res
        .status(404)
        .json({ success: false, message: "Test case not found in this run" });
    }

    const history = await TestRunHistory.findAll({
      where: { test_run_testcase_id: runTestCase.id },
      include: [
        {
          model: User,
          as: "executor",
          attributes: ["user_id", "first_name", "last_name", "avatar"],
        },
      ],
      order: [["executed_at", "DESC"]],
    });

    res.status(200).json({ success: true, data: history });
  } catch (error) {
    console.error("Get Test Case History Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get test case history" });
  }
};

// Remove Test Case from Run
exports.removeTestCaseFromRun = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { runId, testcaseId } = req.params;

    const runTestCase = await TestRunTestCase.findOne({
      where: { test_run_id: runId, testcase_id: testcaseId },
    });

    if (!runTestCase) {
      await transaction.rollback();
      return res
        .status(404)
        .json({ success: false, message: "Test case not found in this run" });
    }

    // Delete associated steps and history
    await TestRunStep.destroy({
      where: { test_run_testcase_id: runTestCase.id },
      transaction,
    });
    await TestRunHistory.destroy({
      where: { test_run_testcase_id: runTestCase.id },
      transaction,
    });
    await runTestCase.destroy({ transaction });

    await transaction.commit();
    res
      .status(200)
      .json({ success: true, message: "Test case removed successfully" });
  } catch (error) {
    await transaction.rollback();
    console.error("Remove Test Case Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to remove test case" });
  }
};

// Bulk Remove Test Cases from Run
exports.bulkRemoveTestCases = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const { runId } = req.params;
    const { testcaseIds } = req.body;

    if (!testcaseIds || !Array.isArray(testcaseIds)) {
      await transaction.rollback();
      return res
        .status(400)
        .json({ success: false, message: "Invalid testcaseIds" });
    }

    const runTestCases = await TestRunTestCase.findAll({
      where: { test_run_id: runId, testcase_id: testcaseIds },
    });

    for (const tc of runTestCases) {
      await TestRunStep.destroy({
        where: { test_run_testcase_id: tc.id },
        transaction,
      });
      await TestRunHistory.destroy({
        where: { test_run_testcase_id: tc.id },
        transaction,
      });
    }

    await TestRunTestCase.destroy({
      where: { test_run_id: runId, testcase_id: testcaseIds },
      transaction,
    });

    await transaction.commit();
    res.status(200).json({
      success: true,
      message: `${testcaseIds.length} test cases removed successfully`,
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Bulk Remove Test Cases Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to remove test cases" });
  }
};

// Bulk Assign Test Cases
exports.bulkAssignTestCases = async (req, res) => {
  try {
    const { runId } = req.params;
    const { testcaseIds, assigneeId } = req.body;

    if (!testcaseIds || !Array.isArray(testcaseIds)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid testcaseIds" });
    }

    await TestRunTestCase.update(
      { assigned_to: assigneeId },
      { where: { test_run_id: runId, testcase_id: testcaseIds } }
    );

    // Send notifications to assignee
    if (assigneeId) {
      const notificationService = require("../services/notification.service");
      const testRun = await TestRun.findByPk(runId);

      for (const testcaseId of testcaseIds) {
        await notificationService.notifyTestCaseAssigned(
          runId,
          testcaseId,
          assigneeId,
          req.user.user_id,
          testRun.project_id
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `${testcaseIds.length} test cases assigned successfully`,
    });
  } catch (error) {
    console.error("Bulk Assign Test Cases Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to assign test cases" });
  }
};

// Re-run Test Case
exports.rerunTestCase = async (req, res) => {
  try {
    const { runId, testcaseId } = req.params;
    const userId = req.user.user_id;

    const runTestCase = await TestRunTestCase.findOne({
      where: { test_run_id: runId, testcase_id: testcaseId },
    });

    if (!runTestCase) {
      return res
        .status(404)
        .json({ success: false, message: "Test case not found in this run" });
    }

    // Reset the test case for re-run
    runTestCase.status = "untested";
    runTestCase.is_locked = false;
    runTestCase.rerun_count = (runTestCase.rerun_count || 0) + 1;
    runTestCase.note = null;
    runTestCase.image_urls = null;
    runTestCase.executed_by = null;
    runTestCase.executed_at = null;

    await runTestCase.save();

    res.status(200).json({ success: true, data: runTestCase });
  } catch (error) {
    console.error("Re-run Test Case Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to re-run test case" });
  }
};

// Upload Test Result Images
exports.uploadTestResultImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No images provided" });
    }

    const uploadPromises = req.files.map((file) => uploadImg(file));
    const imageUrls = await Promise.all(uploadPromises);

    res.status(200).json({ success: true, data: imageUrls });
  } catch (error) {
    console.error("Upload Test Result Images Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to upload images" });
  }
};
