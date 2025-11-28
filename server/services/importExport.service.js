const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");
const csvParser = require("csv-parser");
const testcaseService = require("./testcase.service");

class ImportExportService {
  // Export testcases to Excel
  async exportToExcel(projectId, testcases) {
    const workbook = XLSX.utils.book_new();

    // Prepare data for export
    const data = testcases.map((tc) => ({
      "Testcase ID": tc.testcase_code,
      "Tên Testcase": tc.name,
      "Mô tả": tc.description || "",
      Priority: tc.priority,
      "Pre-condition": tc.pre_condition || "",
      Steps: JSON.stringify(tc.steps),
      "Expected Result": tc.expected_result || "",
      "Actual Result": tc.actual_result || "",
      "Trạng thái": tc.status,
      "Người tạo": tc.creator
        ? `${tc.creator.first_name || ""} ${tc.creator.last_name || ""}`.trim()
        : "",
      "Thời gian tạo": tc.created_at,
      "Người cập nhật": tc.updater
        ? `${tc.updater.first_name || ""} ${tc.updater.last_name || ""}`.trim()
        : "",
      "Thời gian cập nhật": tc.updated_at,
      Version: tc.version,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Testcase ID
      { wch: 30 }, // Tên Testcase
      { wch: 40 }, // Mô tả
      { wch: 10 }, // Priority
      { wch: 30 }, // Pre-condition
      { wch: 50 }, // Steps
      { wch: 30 }, // Expected Result
      { wch: 30 }, // Actual Result
      { wch: 12 }, // Trạng thái
      { wch: 20 }, // Người tạo
      { wch: 20 }, // Thời gian tạo
      { wch: 20 }, // Người cập nhật
      { wch: 20 }, // Thời gian cập nhật
      { wch: 8 }, // Version
    ];
    worksheet["!cols"] = columnWidths;

    XLSX.utils.book_append_sheet(workbook, worksheet, "Test Cases");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    return buffer;
  }

  // Export testcases to CSV
  async exportToCSV(projectId, testcases) {
    const data = testcases.map((tc) => ({
      "Testcase ID": tc.testcase_code,
      "Tên Testcase": tc.name,
      "Mô tả": tc.description || "",
      Priority: tc.priority,
      "Pre-condition": tc.pre_condition || "",
      Steps: JSON.stringify(tc.steps),
      "Expected Result": tc.expected_result || "",
      "Actual Result": tc.actual_result || "",
      "Trạng thái": tc.status,
      "Người tạo": tc.creator
        ? `${tc.creator.first_name || ""} ${tc.creator.last_name || ""}`.trim()
        : "",
      "Thời gian tạo": tc.created_at,
      "Người cập nhật": tc.updater
        ? `${tc.updater.first_name || ""} ${tc.updater.last_name || ""}`.trim()
        : "",
      "Thời gian cập nhật": tc.updated_at,
      Version: tc.version,
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const csv = XLSX.utils.sheet_to_csv(worksheet);

    return Buffer.from(csv, "utf-8");
  }

  // Helper to map row data to testcase object
  mapRowToTestCase(row) {
    // Parse steps
    let steps = [];
    if (row["Steps"]) {
      try {
        steps = JSON.parse(row["Steps"]);
      } catch (e) {
        steps = [{ step_number: 1, description: row["Steps"] }];
      }
    } else if (row["step action"] || row["step data"] || row["step expected result"]) {
       // Handle individual step columns
       steps = [{
           step_number: 1,
           action: row["step action"] || "",
           data: row["step data"] || "",
           expected_result: row["step expected result"] || ""
       }];
    }

    // Sanitize priority
    let priority = (row["Priority"] || row["priority"] || "medium").toLowerCase();
    const allowedPriorities = ["low", "medium", "high", "critical"];
    if (!allowedPriorities.includes(priority)) {
      priority = "medium";
    }

    // Sanitize status
    let status = (row["Trạng thái"] || row["status"] || "draft").toLowerCase();
    const allowedStatuses = ["draft", "approved", "deprecated", "active"];
    if (!allowedStatuses.includes(status)) {
      status = "draft";
    }

    return {
      name: row["Tên Testcase"] || row["name"],
      description: row["Mô tả"] || row["description"],
      priority: priority,
      pre_condition: row["Pre-condition"] || row["pre-condition"],
      steps: steps,
      expected_result: row["Expected Result"] || row["expected_result"],
      actual_result: row["Actual Result"] || row["actual_result"],
      status: status,
    };
  }

  // Import testcases from Excel
  async importFromExcel(projectId, userId, buffer, suiteId = null) {
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    const results = {
      success: 0,
      failed: 0,
      errors: [],
    };

    for (const row of data) {
      try {
        const testcaseData = this.mapRowToTestCase(row);
        
        // Validate required fields
        if (!testcaseData.name) {
             throw new Error("Test case name is required");
        }

        // Assign suite_id if provided
        if (suiteId) {
          testcaseData.suite_id = suiteId;
        }

        await testcaseService.createTestCase(projectId, userId, testcaseData);
        results.success++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          row: row["Tên Testcase"] || row["name"] || "Unknown",
          error: error.message,
        });
      }
    }

    return results;
  }

  // Import testcases from CSV
  async importFromCSV(projectId, userId, buffer, suiteId = null) {
    const { Readable } = require("stream");
    return new Promise((resolve, reject) => {
      const results = {
        success: 0,
        failed: 0,
        errors: [],
      };

      const testcases = [];

      Readable.from(buffer)
        .pipe(csvParser())
        .on("data", (row) => {
          testcases.push(row);
        })
        .on("end", async () => {
          for (const row of testcases) {
            try {
              const testcaseData = this.mapRowToTestCase(row);

               // Validate required fields
                if (!testcaseData.name) {
                     throw new Error("Test case name is required");
                }

              // Assign suite_id if provided
              if (suiteId) {
                testcaseData.suite_id = suiteId;
              }

              await testcaseService.createTestCase(
                projectId,
                userId,
                testcaseData
              );
              results.success++;
            } catch (error) {
              results.failed++;
              results.errors.push({
                row: row["Tên Testcase"] || row["name"] || "Unknown",
                error: error.message,
              });
            }
          }

          resolve(results);
        })
        .on("error", (error) => {
          reject(error);
        });
    });
  }
}

module.exports = new ImportExportService();
