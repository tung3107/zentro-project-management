const cron = require("node-cron");
const ReportService = require("../services/report.service");
const Project = require("../models/Project");

function scheduleReportGeneration() {
  cron.schedule("0 18 * * *", async () => {
    console.log("🕕 Starting scheduled report generation at 6 PM...");

    try {
      const projects = await Project.findAll({
        where: {
          status: "Active",
        },
      });

      console.log(`Found ${projects.length} active projects for reporting`);

      const reportService = new ReportService();
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      for (const project of projects) {
        try {
          const filters = {
            reportType: "project_progress",
            startDate: yesterday.toISOString().split("T")[0],
            endDate: today.toISOString().split("T")[0],
            projectId: project.project_id,
          };

          await reportService.generateReport(
            filters,
            null, // generatedBy = null for auto-generated
            true // saveToDb = true
          );

          console.log(
            `✅ Generated report for project: ${project.project_name}`
          );
        } catch (projectError) {
          console.error(
            `❌ Error generating report for project ${project.project_id}:`,
            projectError.message
          );
        }
      }

      console.log("✅ Scheduled report generation completed");
    } catch (error) {
      console.error("❌ Error in scheduled report generation:", error);
    }
  });

  console.log(
    "📅 Report scheduler initialized - Reports will be generated daily at 6 PM"
  );
}

module.exports = { scheduleReportGeneration };
