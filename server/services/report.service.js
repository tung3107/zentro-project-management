const Task = require("../models/Task");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const User = require("../models/User");
const Member = require("../models/Member");
const Comment = require("../models/Comment");
const ProjectStatus = require("../models/ProjectStatus");
const Report = require("../models/Report");
const { Op, fn, col, literal } = require("sequelize");
const ApiError = require("../utils/ApiError");
const genAI = require("../utils/gemini");
const { saveReportFile } = require("../utils/reportFileHandler");

class ReportService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  /**
   * Generate comprehensive report based on filters
   * @param {object} filters - { reportType, startDate, endDate, projectId, teamId, userId }
   * @param {string} generatedBy - User ID (null for auto-generated)
   * @param {boolean} saveToDb - Whether to save report to database
   */
  async generateReport(filters, generatedBy = null, saveToDb = true) {
    try {
      const { reportType, startDate, endDate, projectId, teamId, userId } =
        filters;

      // Collect data based on filters
      const reportData = await this.collectReportData(filters);

      // Generate AI analysis
      const aiAnalysis = await this.generateAIAnalysis(reportData, reportType);

      const report = {
        reportType,
        filters: {
          startDate,
          endDate,
          projectId,
          teamId,
          userId,
        },
        data: reportData,
        aiAnalysis,
        generatedAt: new Date(),
      };

      // Save to database if requested
      if (saveToDb && projectId) {
        await this.saveReportToDatabase(report, generatedBy);
      }

      return report;
    } catch (err) {
      console.error("Generate report error:", err);
      throw new ApiError(
        err.message || "Không thể tạo báo cáo",
        err.statusCode || 500
      );
    }
  }

  /**
   * Collect data from database based on filters
   */
  async collectReportData(filters) {
    const { startDate, endDate, projectId, teamId, userId } = filters;

    // Build where conditions
    const taskWhere = {};
    const projectWhere = {};

    if (projectId) {
      taskWhere.project_id = projectId;
      projectWhere.project_id = projectId;
    }

    if (startDate && endDate) {
      taskWhere.created_at = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    }

    if (userId) {
      taskWhere[Op.or] = [{ assignee_id: userId }, { reporter_id: userId }];
    }

    // Get tasks with all details
    const tasks = await Task.findAll({
      where: taskWhere,
      include: [
        {
          model: User,
          as: "assignee",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
        {
          model: User,
          as: "reporter",
          attributes: ["user_id", "first_name", "last_name", "email"],
        },
        {
          model: ProjectStatus,
          as: "status",
          attributes: ["status_id", "name"],
        },
        {
          model: Sprint,
          as: "sprint",
          attributes: ["sprint_id", "name", "status", "start_date", "end_date"],
        },
        {
          model: Project,
          as: "project",
          attributes: ["project_id", "project_name", "status"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    // Get comments for context
    const taskIds = tasks.map((t) => t.task_id);
    const comments = await Comment.findAll({
      where: { task_id: { [Op.in]: taskIds } },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["user_id", "first_name", "last_name"],
        },
      ],
    });

    // Get project members if projectId specified
    let members = [];
    if (projectId) {
      members = await Member.findAll({
        where: { project_id: projectId, is_delete: false },
        include: [
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "first_name",
              "last_name",
              "email",
              "avatar",
            ],
          },
        ],
      });
    }

    // Get sprints
    const sprints = await Sprint.findAll({
      where: projectId ? { project_id: projectId } : {},
      order: [["start_date", "DESC"]],
    });

    // Calculate statistics
    const stats = this.calculateStatistics(tasks, sprints, members);

    return {
      tasks: tasks.map((t) => this.formatTask(t)),
      comments: comments.map((c) => this.formatComment(c)),
      members: members.map((m) => this.formatMember(m)),
      sprints: sprints.map((s) => this.formatSprint(s)),
      stats,
    };
  }

  /**
   * Format task data for JSON
   */
  formatTask(task) {
    const now = new Date();
    const dueDate = task.due_date ? new Date(task.due_date) : null;

    // Determine status type based on status name
    let statusType = "todo";
    if (task.status?.name) {
      const statusName = task.status.name.toLowerCase();
      if (
        statusName.includes("done") ||
        statusName.includes("complete") ||
        statusName.includes("closed")
      ) {
        statusType = "done";
      } else if (
        statusName.includes("progress") ||
        statusName.includes("doing")
      ) {
        statusType = "in_progress";
      }
    }

    const isOverdue = dueDate && dueDate < now && statusType !== "done";
    const daysUntilDue = dueDate
      ? Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24))
      : null;

    return {
      task_id: task.task_id,
      title: task.title,
      description: task.description,
      type: task.type,
      priority: task.priority,
      status: task.status?.name || "Unknown",
      status_type: statusType,
      assignee: task.assignee
        ? `${task.assignee.first_name} ${task.assignee.last_name}`
        : "Unassigned",
      assignee_id: task.assignee_id,
      reporter: task.reporter
        ? `${task.reporter.first_name} ${task.reporter.last_name}`
        : "Unknown",
      estimate: task.estimate,
      spent_time: task.spent_time,
      start_date: task.start_date,
      due_date: task.due_date,
      created_at: task.created_at,
      updated_at: task.updated_at,
      sprint: task.sprint?.name || "Backlog",
      sprint_status: task.sprint?.status,
      project_name: task.project?.project_name,
      is_overdue: isOverdue,
      days_until_due: daysUntilDue,
    };
  }

  /**
   * Format comment data
   */
  formatComment(comment) {
    return {
      comment_id: comment.comment_id,
      task_id: comment.task_id,
      content: comment.content,
      user: comment.user
        ? `${comment.user.first_name} ${comment.user.last_name}`
        : "Unknown",
      created_at: comment.created_at,
    };
  }

  /**
   * Format member data
   */
  formatMember(member) {
    return {
      user_id: member.user_id,
      name: `${member.user.first_name} ${member.user.last_name}`,
      email: member.user.email,
      avatar: member.user.avatar,
    };
  }

  /**
   * Format sprint data
   */
  formatSprint(sprint) {
    return {
      sprint_id: sprint.sprint_id,
      name: sprint.name,
      goal: sprint.goal,
      status: sprint.status,
      start_date: sprint.start_date,
      end_date: sprint.end_date,
      velocity_estimate: sprint.velocity_estimate,
    };
  }

  /**
   * Calculate comprehensive statistics
   */
  calculateStatistics(tasks, sprints, members) {
    const stats = {
      total_tasks: tasks.length,
      completed_tasks: 0,
      in_progress_tasks: 0,
      pending_tasks: 0,
      overdue_tasks: 0,
      tasks_by_priority: { 0: 0, 1: 0, 2: 0, 3: 0 },
      tasks_by_type: {},
      total_estimate: 0,
      total_spent_time: 0,
      completion_percentage: 0,
      sprint_stats: {
        total: sprints.length,
        active: 0,
        completed: 0,
        planned: 0,
      },
      member_performance: {},
      upcoming_deadlines: [],
      overdue_list: [],
    };

    const now = new Date();

    tasks.forEach((task) => {
      // Determine status type based on status name
      let statusType = "todo";
      if (task.status?.name) {
        const statusName = task.status.name.toLowerCase();
        if (
          statusName.includes("done") ||
          statusName.includes("complete") ||
          statusName.includes("closed")
        ) {
          statusType = "done";
        } else if (
          statusName.includes("progress") ||
          statusName.includes("doing")
        ) {
          statusType = "in_progress";
        }
      }

      // Status counts
      if (statusType === "done") {
        stats.completed_tasks++;
      } else if (statusType === "in_progress") {
        stats.in_progress_tasks++;
      } else {
        stats.pending_tasks++;
      }

      // Priority counts
      if (task.priority in stats.tasks_by_priority) {
        stats.tasks_by_priority[task.priority]++;
      }

      // Type counts
      if (!stats.tasks_by_type[task.type]) {
        stats.tasks_by_type[task.type] = 0;
      }
      stats.tasks_by_type[task.type]++;

      // Time tracking
      if (task.estimate) {
        stats.total_estimate += task.estimate;
      }
      if (task.spent_time) {
        stats.total_spent_time += task.spent_time;
      }

      // Overdue tasks
      const dueDate = task.due_date ? new Date(task.due_date) : null;
      if (dueDate && dueDate < now && statusType !== "done") {
        stats.overdue_tasks++;
        stats.overdue_list.push({
          task_id: task.task_id,
          title: task.title,
          due_date: task.due_date,
          assignee: task.assignee
            ? `${task.assignee.first_name} ${task.assignee.last_name}`
            : "Unassigned",
          days_overdue: Math.ceil((now - dueDate) / (1000 * 60 * 60 * 24)),
        });
      }

      // Upcoming deadlines (next 7 days)
      if (
        dueDate &&
        dueDate > now &&
        dueDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) &&
        statusType !== "done"
      ) {
        stats.upcoming_deadlines.push({
          task_id: task.task_id,
          title: task.title,
          due_date: task.due_date,
          assignee: task.assignee
            ? `${task.assignee.first_name} ${task.assignee.last_name}`
            : "Unassigned",
          days_until_due: Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24)),
        });
      }

      // Member performance
      if (task.assignee_id) {
        const assigneeId = task.assignee_id;
        const assigneeName = task.assignee
          ? `${task.assignee.first_name} ${task.assignee.last_name}`
          : "Unknown";

        if (!stats.member_performance[assigneeId]) {
          stats.member_performance[assigneeId] = {
            name: assigneeName,
            total_tasks: 0,
            completed_tasks: 0,
            in_progress_tasks: 0,
            overdue_tasks: 0,
            total_spent_time: 0,
          };
        }

        stats.member_performance[assigneeId].total_tasks++;
        if (statusType === "done") {
          stats.member_performance[assigneeId].completed_tasks++;
        } else if (statusType === "in_progress") {
          stats.member_performance[assigneeId].in_progress_tasks++;
        }
        if (dueDate && dueDate < now && statusType !== "done") {
          stats.member_performance[assigneeId].overdue_tasks++;
        }
        if (task.spent_time) {
          stats.member_performance[assigneeId].total_spent_time +=
            task.spent_time;
        }
      }
    });

    // Sprint stats
    sprints.forEach((sprint) => {
      if (sprint.status === "active") {
        stats.sprint_stats.active++;
      } else if (sprint.status === "completed") {
        stats.sprint_stats.completed++;
      } else {
        stats.sprint_stats.planned++;
      }
    });

    // Completion percentage
    stats.completion_percentage =
      stats.total_tasks > 0
        ? Math.round((stats.completed_tasks / stats.total_tasks) * 100)
        : 0;

    // Sort lists
    stats.overdue_list.sort((a, b) => b.days_overdue - a.days_overdue);
    stats.upcoming_deadlines.sort(
      (a, b) => a.days_until_due - b.days_until_due
    );

    return stats;
  }

  /**
   * Generate AI analysis using Gemini
   */
  async generateAIAnalysis(reportData, reportType) {
    try {
      const prompt = this.buildAIPrompt(reportData, reportType);

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return response;
    } catch (err) {
      console.error("AI analysis error:", err);
      // Return fallback analysis if AI fails
      return this.generateFallbackAnalysis(reportData, reportType);
    }
  }

  /**
   * Build AI prompt based on report type and data
   */
  buildAIPrompt(reportData, reportType) {
    const { stats, tasks, sprints } = reportData;

    let prompt = `Bạn là trợ lý AI phân tích dự án phần mềm chuyên nghiệp.

Dữ liệu dự án:
- Tổng số task: ${stats.total_tasks}
- Task hoàn thành: ${stats.completed_tasks} (${stats.completion_percentage}%)
- Task đang làm: ${stats.in_progress_tasks}
- Task chưa làm: ${stats.pending_tasks}
- Task quá hạn: ${stats.overdue_tasks}
- Tổng thời gian ước lượng: ${stats.total_estimate || 0} giờ
- Tổng thời gian đã dùng: ${stats.total_spent_time || 0} giờ

Sprint:
- Tổng sprint: ${stats.sprint_stats.total}
- Sprint đang chạy: ${stats.sprint_stats.active}
- Sprint hoàn thành: ${stats.sprint_stats.completed}

`;

    if (reportType === "project_progress") {
      prompt += `
Loại báo cáo: TIẾN ĐỘ DỰ ÁN

Hãy tạo báo cáo phân tích tiến độ dự án bao gồm:
1. **Tóm tắt tổng quan tiến độ** (${stats.completed_tasks}/${stats.total_tasks} task hoàn thành)
2. **Phân tích chi tiết:**
   - Tỷ lệ hoàn thành và xu hướng
   - Đánh giá về task quá hạn (${stats.overdue_tasks} task)
   - Phân tích về thời gian (ước lượng vs thực tế)
3. **Highlight các vấn đề quan trọng:**
   - Task ưu tiên cao chưa hoàn thành
   - Deadline sắp tới
   - Rủi ro tiềm ẩn
4. **Đề xuất hành động cụ thể** để cải thiện tiến độ

Trình bày bằng Markdown, dễ đọc, có bullet points, highlight số liệu quan trọng bằng **bold**.
`;
    } else if (reportType === "team_performance") {
      const memberPerf = Object.values(stats.member_performance);
      prompt += `
Loại báo cáo: HIỆU SUẤT TEAM/NHÂN VIÊN

Thành viên team (${memberPerf.length} người):
${memberPerf
  .map(
    (m, i) =>
      `${i + 1}. ${m.name}: ${m.completed_tasks}/${
        m.total_tasks
      } task hoàn thành, ${m.overdue_tasks} task trễ, ${
        m.total_spent_time
      }h làm việc`
  )
  .join("\n")}

Hãy tạo báo cáo phân tích hiệu suất team bao gồm:
1. **Tóm tắt hiệu suất chung của team**
2. **Phân tích từng thành viên:**
   - Ai đang làm tốt (hoàn thành nhiều, ít trễ deadline)
   - Ai cần hỗ trợ (nhiều task trễ, tốc độ chậm)
   - So sánh tương đối giữa các thành viên
3. **Nhận xét về phân bổ công việc:**
   - Có người bị quá tải không?
   - Có người nhàn rỗi không?
4. **Đề xuất hành động cụ thể:**
   - Cân nhắc phân bổ lại resource
   - Hỗ trợ/training cho ai
   - Khen thưởng/động viên

Trình bày bằng Markdown, dễ đọc, có bullet points, highlight số liệu quan trọng bằng **bold**.
`;
    } else if (reportType === "task_deadline") {
      prompt += `
Loại báo cáo: TASK QUÁ HẠN / SẮP TỚI DEADLINE

Task quá hạn (${stats.overdue_tasks}):
${stats.overdue_list
  .slice(0, 10)
  .map(
    (t, i) =>
      `${i + 1}. ${t.title} - Trễ ${t.days_overdue} ngày - Người làm: ${
        t.assignee
      }`
  )
  .join("\n")}

Task sắp đến deadline (${stats.upcoming_deadlines.length}):
${stats.upcoming_deadlines
  .slice(0, 10)
  .map(
    (t, i) =>
      `${i + 1}. ${t.title} - Còn ${t.days_until_due} ngày - Người làm: ${
        t.assignee
      }`
  )
  .join("\n")}

Hãy tạo báo cáo phân tích deadline bao gồm:
1. **Tình hình task quá hạn:**
   - Số lượng và mức độ nghiêm trọng
   - Nguyên nhân có thể (ước lượng sai, thiếu resource, blocking issues)
2. **Task sắp đến deadline:**
   - Ưu tiên xử lý task nào trước
   - Đánh giá rủi ro không hoàn thành đúng hạn
3. **Phân tích theo người thực hiện:**
   - Ai có nhiều task trễ nhất
   - Người nào cần hỗ trợ gấp
4. **Đề xuất hành động ngay:**
   - Task cần ưu tiên xử lý trước
   - Cần thêm người vào task nào
   - Cân nhắc dời deadline

Trình bày bằng Markdown, dễ đọc, có bullet points, highlight số liệu quan trọng bằng **bold**.
`;
    } else {
      // General report
      prompt += `
Loại báo cáo: TỔNG HỢP DỰ ÁN

Hãy tạo báo cáo tổng hợp dự án bao gồm:
1. **Executive Summary** - Tóm tắt ngắn gọn tình hình dự án
2. **Tiến độ dự án** - Chi tiết về task completion, sprint progress
3. **Hiệu suất team** - Phân tích performance của các thành viên
4. **Vấn đề và rủi ro** - Highlight các issue cần chú ý
5. **Đề xuất hành động** - Các bước cụ thể để cải thiện

Trình bày bằng Markdown, dễ đọc, có bullet points, highlight số liệu quan trọng bằng **bold**.
`;
    }

    return prompt;
  }

  /**
   * Generate fallback analysis if AI fails
   */
  generateFallbackAnalysis(reportData, reportType) {
    const { stats } = reportData;

    return `# Báo cáo Dự án

## Tóm tắt Tiến độ

- **Tổng số task**: ${stats.total_tasks}
- **Hoàn thành**: ${stats.completed_tasks} (${stats.completion_percentage}%)
- **Đang làm**: ${stats.in_progress_tasks}
- **Chưa bắt đầu**: ${stats.pending_tasks}
- **Quá hạn**: ${stats.overdue_tasks}

## Phân tích Sprint

- **Tổng sprint**: ${stats.sprint_stats.total}
- **Đang chạy**: ${stats.sprint_stats.active}
- **Đã hoàn thành**: ${stats.sprint_stats.completed}
- **Đang lên kế hoạch**: ${stats.sprint_stats.planned}

## Hiệu suất Team

${Object.values(stats.member_performance)
  .map(
    (m) =>
      `- **${m.name}**: ${m.completed_tasks}/${m.total_tasks} task hoàn thành, ${m.overdue_tasks} task trễ`
  )
  .join("\n")}

## Đề xuất

${
  stats.overdue_tasks > 0
    ? `- ⚠️ Cần xử lý ${stats.overdue_tasks} task quá hạn ngay\n`
    : ""
}${
      stats.upcoming_deadlines.length > 0
        ? `- 📅 Theo dõi ${stats.upcoming_deadlines.length} task sắp đến deadline\n`
        : ""
    }${
      stats.completion_percentage < 50
        ? "- 🚀 Đẩy nhanh tiến độ để đạt mục tiêu dự án\n"
        : ""
    }
`;
  }

  /**
   * Get available projects for report filtering
   */
  async getAvailableProjects(userId) {
    try {
      // Get projects where user is a member
      const members = await Member.findAll({
        where: { user_id: userId, is_delete: false },
        include: [
          {
            model: Project,
            as: "project",
            attributes: ["project_id", "project_name", "status"],
          },
        ],
      });

      return members.map((m) => ({
        project_id: m.project.project_id,
        project_name: m.project.project_name,
        status: m.project.status,
      }));
    } catch (err) {
      console.error("Get available projects error:", err);
      throw new ApiError("Không thể lấy danh sách dự án", 500);
    }
  }

  /**
   * Get team members for filtering
   */
  async getTeamMembers(projectId) {
    try {
      const members = await Member.findAll({
        where: { project_id: projectId, is_delete: false },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["user_id", "first_name", "last_name", "email"],
          },
        ],
      });

      return members.map((m) => ({
        user_id: m.user_id,
        name: `${m.user.first_name} ${m.user.last_name}`,
        email: m.user.email,
      }));
    } catch (err) {
      console.error("Get team members error:", err);
      throw new ApiError("Không thể lấy danh sách thành viên", 500);
    }
  }

  /**
   * Save report to database
   * @param {object} report - Generated report data
   * @param {string} generatedBy - User ID (null for auto-generated)
   */
  async saveReportToDatabase(report, generatedBy = null) {
    try {
      const { reportType, filters, data, aiAnalysis } = report;
      const { projectId, startDate, endDate, userId } = filters;

      // Save report file
      const fileUrl = await saveReportFile(
        { data, aiAnalysis },
        projectId,
        reportType
      );

      // Generate report name
      const reportTypeName = {
        project_progress: "Tiến độ dự án",
        team_performance: "Hiệu suất team",
        task_deadline: "Task & Deadline",
        general: "Báo cáo tổng hợp",
      }[reportType];

      const reportName = `${reportTypeName} - ${new Date(
        startDate
      ).toLocaleDateString("vi-VN")} đến ${new Date(endDate).toLocaleDateString(
        "vi-VN"
      )}`;

      // Save to database
      const savedReport = await Report.create({
        project_id: projectId,
        report_type: reportType,
        report_name: reportName,
        start_date: new Date(startDate),
        end_date: new Date(endDate),
        filters: { userId },
        statistics: data.stats,
        ai_analysis: aiAnalysis,
        file_url: fileUrl,
        is_auto_generated: generatedBy === null,
        generated_by: generatedBy,
      });

      return savedReport;
    } catch (err) {
      console.error("Save report to database error:", err);
      throw new ApiError("Không thể lưu báo cáo", 500);
    }
  }

  /**
   * Get report history for a project
   * @param {string} projectId
   * @param {number} limit - Number of reports to fetch
   */
  async getReportHistory(projectId, limit = 10) {
    try {
      const reports = await Report.findAll({
        where: { project_id: projectId },
        include: [
          {
            model: User,
            as: "generator",
            attributes: ["user_id", "first_name", "last_name", "email"],
            required: false,
          },
        ],
        order: [["created_at", "DESC"]],
        limit,
      });

      return reports;
    } catch (err) {
      console.error("Get report history error:", err);
      throw new ApiError("Không thể lấy lịch sử báo cáo", 500);
    }
  }
}

module.exports = ReportService;
