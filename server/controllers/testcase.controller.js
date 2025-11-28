const testcaseService = require("../services/testcase.service");
const importExportService = require("../services/importExport.service");
const { catchAsync } = require("../utils/catchAsync");

// TestCase controllers
exports.createTestCase = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.user_id;

  const testcase = await testcaseService.createTestCase(
    projectId,
    userId,
    req.body
  );

  res.status(201).json({
    status: "success",
    data: testcase,
  });
});

exports.getTestCases = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const filters = {
    suite_id: req.query.suite_id,
    priority: req.query.priority,
    status: req.query.status,
    created_by: req.query.created_by,
    search: req.query.search,
    date_from: req.query.date_from,
    date_to: req.query.date_to,
  };

  const testcases = await testcaseService.getTestCases(projectId, filters);

  res.status(200).json({
    status: "success",
    data: testcases,
  });
});

exports.getTestCaseById = catchAsync(async (req, res) => {
  const { testcaseId } = req.params;

  const testcase = await testcaseService.getTestCaseById(testcaseId);

  res.status(200).json({
    status: "success",
    data: testcase,
  });
});

exports.updateTestCase = catchAsync(async (req, res) => {
  const { testcaseId } = req.params;
  const userId = req.user.user_id;

  const testcase = await testcaseService.updateTestCase(
    testcaseId,
    userId,
    req.body
  );

  res.status(200).json({
    status: "success",
    data: testcase,
  });
});

exports.deleteTestCase = catchAsync(async (req, res) => {
  const { testcaseId } = req.params;

  await testcaseService.deleteTestCase(testcaseId);

  res.status(200).json({
    status: "success",
    message: "Test case deleted successfully",
  });
});

exports.getVersionHistory = catchAsync(async (req, res) => {
  const { testcaseId } = req.params;

  const versions = await testcaseService.getVersionHistory(testcaseId);

  res.status(200).json({
    status: "success",
    data: versions,
  });
});

exports.uploadAttachment = catchAsync(async (req, res) => {
  const { testcaseId } = req.params;
  const userId = req.user.user_id;

  if (!req.file) {
    return res.status(400).json({
      status: "fail",
      message: "No file uploaded",
    });
  }

  const attachment = await testcaseService.uploadAttachment(
    testcaseId,
    userId,
    req.file
  );

  res.status(201).json({
    status: "success",
    data: attachment,
  });
});

exports.deleteAttachment = catchAsync(async (req, res) => {
  const { attachmentId } = req.params;

  await testcaseService.deleteAttachment(attachmentId);

  res.status(200).json({
    status: "success",
    message: "Attachment deleted successfully",
  });
});

// TestSuite controllers
exports.createTestSuite = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.user_id;

  const suite = await testcaseService.createTestSuite(
    projectId,
    userId,
    req.body
  );

  res.status(201).json({
    status: "success",
    data: suite,
  });
});

exports.getTestSuites = catchAsync(async (req, res) => {
  const { projectId } = req.params;

  const suites = await testcaseService.getTestSuites(projectId);

  res.status(200).json({
    status: "success",
    data: suites,
  });
});

exports.updateTestSuite = catchAsync(async (req, res) => {
  const { suiteId } = req.params;

  const suite = await testcaseService.updateTestSuite(suiteId, req.body);

  res.status(200).json({
    status: "success",
    data: suite,
  });
});

exports.deleteTestSuite = catchAsync(async (req, res) => {
  const { suiteId } = req.params;
  const { moveToSuiteId } = req.body;

  await testcaseService.deleteTestSuite(suiteId, moveToSuiteId);

  res.status(200).json({
    status: "success",
    message: "Test suite deleted successfully",
  });
});

exports.duplicateTestSuite = catchAsync(async (req, res) => {
  const { suiteId } = req.params;
  const { targetParentSuiteId } = req.body;
  const userId = req.user.user_id;

  const suite = await testcaseService.duplicateTestSuite(
    suiteId,
    targetParentSuiteId,
    userId
  );

  res.status(201).json({
    status: "success",
    data: suite,
  });
});

exports.getSuiteChildren = catchAsync(async (req, res) => {
  const { suiteId } = req.params;

  const children = await testcaseService.suiteHasChildren(suiteId);

  res.status(200).json({
    status: "success",
    data: children,
  });
});

exports.getTestCasesByTask = catchAsync(async (req, res) => {
  const { taskId } = req.params;

  const testcases = await testcaseService.getTestCasesByTask(taskId);

  res.status(200).json({
    status: "success",
    data: testcases,
  });
});

exports.getTestSuitesByTask = catchAsync(async (req, res) => {
  const { taskId } = req.params;

  const suites = await testcaseService.getTestSuitesByTask(taskId);

  res.status(200).json({
    status: "success",
    data: suites,
  });
});

// Import/Export controllers
exports.exportTestCases = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const format = req.query.format || "csv"; // csv or excel

  const testcases = await testcaseService.getTestCases(projectId);

  let buffer;
  let filename;
  let contentType;

  if (format === "excel" || format === "xlsx") {
    buffer = await importExportService.exportToExcel(projectId, testcases);
    filename = `testcases_${projectId}_${Date.now()}.xlsx`;
    contentType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  } else {
    buffer = await importExportService.exportToCSV(projectId, testcases);
    filename = `testcases_${projectId}_${Date.now()}.csv`;
    contentType = "text/csv";
  }

  res.setHeader("Content-Type", contentType);
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(buffer);
});

exports.importTestCases = catchAsync(async (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.user_id;
  const { suite_id } = req.body;

  if (!req.file) {
    return res.status(400).json({
      status: "fail",
      message: "No file uploaded",
    });
  }

  let results;
  const ext = req.file.originalname.split(".").pop().toLowerCase();

  if (ext === "xlsx" || ext === "xls") {
    results = await importExportService.importFromExcel(
      projectId,
      userId,
      req.file.buffer,
      suite_id
    );
  } else if (ext === "csv") {
    results = await importExportService.importFromCSV(
      projectId,
      userId,
      req.file.buffer,
      suite_id
    );
  } else {
    return res.status(400).json({
      status: "fail",
      message: "Unsupported file format. Use Excel or CSV.",
    });
  }

  res.status(200).json({
    status: "success",
    data: results,
  });
});
