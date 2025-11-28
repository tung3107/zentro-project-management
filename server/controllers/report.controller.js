const ReportService = require("../services/report.service");
const { catchAsync } = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");

// ================================
// GENERATE REPORT
// POST /api/reports/generate
// Body: { reportType, startDate, endDate, projectId, teamId, userId }
// ================================
exports.generateReport = catchAsync(async (req, res, next) => {
  const {
    reportType,
    startDate,
    endDate,
    projectId,
    teamId,
    userId: filterUserId,
  } = req.body;

  // Validate required fields
  if (!reportType) {
    throw new ApiError("Report type is required", 400);
  }

  if (!startDate || !endDate) {
    throw new ApiError("Start date and end date are required", 400);
  }

  // Validate date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (start > end) {
    throw new ApiError("Start date must be before end date", 400);
  }

  const filters = {
    reportType,
    startDate,
    endDate,
    projectId,
    teamId,
    userId: filterUserId,
  };

  const reportService = new ReportService();
  const report = await reportService.generateReport(
    filters,
    req.user.user_id,
    true
  );

  res.status(200).json({
    status: "success",
    data: report,
  });
});

// ================================
// GET AVAILABLE PROJECTS FOR FILTER
// GET /api/reports/projects
// ================================
exports.getAvailableProjects = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;

  const reportService = new ReportService();
  const projects = await reportService.getAvailableProjects(userId);

  res.status(200).json({
    status: "success",
    data: projects,
  });
});

// ================================
// GET TEAM MEMBERS FOR FILTER
// GET /api/reports/team-members/:projectId
// ================================
exports.getTeamMembers = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;

  if (!projectId) {
    throw new ApiError("Project ID is required", 400);
  }

  const reportService = new ReportService();
  const members = await reportService.getTeamMembers(projectId);

  res.status(200).json({
    status: "success",
    data: members,
  });
});

// ================================
// EXPORT REPORT TO PDF (Placeholder)
// POST /api/reports/export-pdf
// Body: report data
// ================================
exports.exportReportToPDF = catchAsync(async (req, res, next) => {
  // This is a placeholder for PDF export functionality
  // You can implement PDF generation using libraries like puppeteer or pdfkit

  const reportData = req.body;

  if (!reportData) {
    throw new ApiError("Report data is required", 400);
  }

  // TODO: Implement PDF generation
  // For now, just return success
  res.status(200).json({
    status: "success",
    message: "PDF export feature is under development",
    data: {
      format: "pdf",
      // In real implementation, this would be a download URL or base64 PDF
    },
  });
});

// ================================
// SEND REPORT VIA EMAIL (Placeholder)
// POST /api/reports/send-email
// Body: { report, recipients }
// ================================
exports.sendReportEmail = catchAsync(async (req, res, next) => {
  const { report, recipients } = req.body;

  if (!report || !recipients || !Array.isArray(recipients)) {
    throw new ApiError("Report and recipients are required", 400);
  }

  // TODO: Implement email sending using existing email service
  // For now, just return success
  res.status(200).json({
    status: "success",
    message: "Email sending feature is under development",
    data: {
      recipients,
      sentAt: new Date(),
    },
  });
});

// ================================
// GET REPORT HISTORY
// GET /api/reports/history/:projectId
// ================================
exports.getReportHistory = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const limit = parseInt(req.query.limit) || 10;

  if (!projectId) {
    throw new ApiError("Project ID is required", 400);
  }

  const reportService = new ReportService();
  const reports = await reportService.getReportHistory(projectId, limit);

  res.status(200).json({
    status: "success",
    data: reports,
  });
});
