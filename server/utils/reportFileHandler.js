const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const writeFile = promisify(fs.writeFile);
const mkdir = promisify(fs.mkdir);

/**
 * Save report data as JSON file
 * @param {Object} reportData - Complete report data
 * @param {String} projectId - Project ID
 * @param {String} reportType - Type of report
 * @returns {Promise<String>} - File URL/path
 */
async function saveReportFile(reportData, projectId, reportType) {
  try {
    // Create reports directory if it doesn't exist
    const reportsDir = path.join(__dirname, "../uploads/reports");

    if (!fs.existsSync(reportsDir)) {
      await mkdir(reportsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `report_${projectId}_${reportType}_${timestamp}.json`;
    const filePath = path.join(reportsDir, filename);

    // Save report as JSON
    await writeFile(filePath, JSON.stringify(reportData, null, 2), "utf8");

    // Return relative URL (for accessing via web server)
    return `/uploads/reports/${filename}`;
  } catch (error) {
    console.error("Error saving report file:", error);
    throw new Error("Failed to save report file");
  }
}

/**
 * Delete report file
 * @param {String} fileUrl - File URL to delete
 */
async function deleteReportFile(fileUrl) {
  try {
    if (!fileUrl) return;

    const filename = path.basename(fileUrl);
    const filePath = path.join(__dirname, "../uploads/reports", filename);

    if (fs.existsSync(filePath)) {
      await promisify(fs.unlink)(filePath);
    }
  } catch (error) {
    console.error("Error deleting report file:", error);
  }
}

module.exports = {
  saveReportFile,
  deleteReportFile,
};
