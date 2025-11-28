const genAI = require("../utils/gemini");
const Task = require("../models/Task");
const Project = require("../models/Project");
const Member = require("../models/Member");
const User = require("../models/User");
const Sprint = require("../models/Sprint");
const ProjectStatus = require("../models/ProjectStatus");
const { Op, fn, col } = require("sequelize");
const ApiError = require("../utils/ApiError");

class AiChatbotService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  /**
   * Generate AI response based on user query and project context
   */
  async generateResponse(userId, projectId, userMessage) {
    try {
      // Get project context
      const projectContext = await this.getProjectContext(userId, projectId);

      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(projectContext);

      // Generate response
      const chat = this.model.startChat({
        history: [
          {
            role: "user",
            parts: [{ text: systemPrompt }],
          },
          {
            role: "model",
            parts: [
              {
                text: "Tôi đã hiểu context của dự án. Tôi sẵn sàng hỗ trợ bạn về tasks, sprints, tiến độ dự án và các thông tin liên quan. Hãy hỏi tôi bất cứ điều gì!",
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = result.response.text();

      return response;
    } catch (err) {
      console.error("AI generation error:", err);
      throw new ApiError("Không thể tạo phản hồi AI", 500);
    }
  }

  /**
   * Get comprehensive project context for AI
   */
  async getProjectContext(userId, projectId) {
    try {
      // Get project info
      const project = await Project.findByPk(projectId);
      if (!project) {
        throw new ApiError("Không tìm thấy dự án", 404);
      }

      // Get all tasks in project with details
      const tasks = await Task.findAll({
        where: { project_id: projectId },
        include: [
          {
            model: User,
            as: "assignee",
            attributes: ["user_id", "first_name", "last_name", "email"],
          },
          {
            model: User,
            as: "reporter",
            attributes: ["user_id", "first_name", "last_name"],
          },
          {
            model: ProjectStatus,
            as: "status",
            attributes: ["status_id", "name"],
          },
          {
            model: Sprint,
            as: "sprint",
            attributes: [
              "sprint_id",
              "name",
              "start_date",
              "end_date",
              "status",
            ],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      // Get sprints
      const sprints = await Sprint.findAll({
        where: { project_id: projectId },
        order: [["start_date", "DESC"]],
      });

      // Get members
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

      // Calculate statistics
      const stats = this.calculateProjectStats(tasks, sprints);

      return {
        project,
        tasks,
        sprints,
        members,
        stats,
        userId,
      };
    } catch (err) {
      console.error("getProjectContext error:", err);
      throw err;
    }
  }

  /**
   * Calculate project statistics
   */
  calculateProjectStats(tasks, sprints) {
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(
      (t) =>
        t.status?.status_name?.toLowerCase().includes("hoàn thành") ||
        t.status?.status_name?.toLowerCase().includes("done")
    ).length;
    const inProgressTasks = tasks.filter(
      (t) =>
        t.status?.status_name?.toLowerCase().includes("đang làm") ||
        t.status?.status_name?.toLowerCase().includes("in progress")
    ).length;
    const todoTasks = tasks.filter(
      (t) =>
        t.status?.status_name?.toLowerCase().includes("cần làm") ||
        t.status?.status_name?.toLowerCase().includes("to do")
    ).length;

    const highPriorityTasks = tasks.filter((t) => t.priority >= 3).length;
    const overdueTasks = tasks.filter(
      (t) =>
        t.due_date &&
        new Date(t.due_date) < new Date() &&
        !t.status?.status_name?.toLowerCase().includes("hoàn thành")
    ).length;

    const activeSprints = sprints.filter((s) => s.status === "active").length;
    const completedSprints = sprints.filter(
      (s) => s.status === "completed"
    ).length;

    const totalEstimate = tasks.reduce((sum, t) => sum + (t.estimate || 0), 0);
    const totalSpent = tasks.reduce((sum, t) => sum + (t.spent_time || 0), 0);

    const completionRate =
      totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(1) : 0;

    return {
      totalTasks,
      completedTasks,
      inProgressTasks,
      todoTasks,
      highPriorityTasks,
      overdueTasks,
      activeSprints,
      completedSprints,
      totalEstimate,
      totalSpent,
      completionRate,
    };
  }

  /**
   * Build system prompt with project context
   */
  buildSystemPrompt(context) {
    const { project, tasks, sprints, members, stats, userId } = context;

    const tasksSummary = tasks
      .slice(0, 50)
      .map(
        (t) =>
          `- Task ${t.task_id}: "${t.title}" | Trạng thái: ${
            t.status?.status_name || "N/A"
          } | Ưu tiên: ${this.getPriorityText(t.priority)} | Người làm: ${
            t.assignee
              ? `${t.assignee.first_name} ${t.assignee.last_name}`
              : "Chưa assign"
          } | Sprint: ${t.sprint?.name || "N/A"} | Hạn: ${
            t.due_date
              ? new Date(t.due_date).toLocaleDateString("vi-VN")
              : "N/A"
          }`
      )
      .join("\n");

    const sprintsSummary = sprints
      .map(
        (s) =>
          `- Sprint "${s.name}": ${s.status} | ${new Date(
            s.start_date
          ).toLocaleDateString("vi-VN")} - ${new Date(
            s.end_date
          ).toLocaleDateString("vi-VN")}`
      )
      .join("\n");

    const membersSummary = members
      .map(
        (m) => `- ${m.user.first_name} ${m.user.last_name} (${m.user.email})`
      )
      .join("\n");

    return `Bạn là trợ lý AI thông minh cho hệ thống quản lý dự án. Nhiệm vụ của bạn là hỗ trợ người dùng về dự án họ đang làm việc.

📊 THÔNG TIN DỰ ÁN:
Tên: ${project.project_name}
Mô tả: ${project.description || "Không có mô tả"}
Trạng thái: ${project.status}
Thời gian: ${new Date(project.start_date).toLocaleDateString(
      "vi-VN"
    )} - ${new Date(project.end_date).toLocaleDateString("vi-VN")}

📈 THỐNG KÊ:
- Tổng số task: ${stats.totalTasks}
- Hoàn thành: ${stats.completedTasks} (${stats.completionRate}%)
- Đang làm: ${stats.inProgressTasks}
- Cần làm: ${stats.todoTasks}
- Ưu tiên cao: ${stats.highPriorityTasks}
- Quá hạn: ${stats.overdueTasks}
- Sprint đang chạy: ${stats.activeSprints}
- Sprint hoàn thành: ${stats.completedSprints}
- Thời gian ước lượng: ${stats.totalEstimate}h
- Thời gian đã dùng: ${stats.totalSpent}h

📋 DANH SÁCH TASKS (50 tasks gần nhất):
${tasksSummary}

🏃 SPRINTS:
${sprintsSummary}

👥 THÀNH VIÊN:
${membersSummary}

🎯 HƯỚNG DẪN:
1. Trả lời bằng tiếng Việt, ngắn gọn, rõ ràng, thân thiện
2. Khi người dùng hỏi về task, hãy tìm theo ID hoặc tên (tìm gần đúng)
3. Khi tóm tắt task, bao gồm: ID, tên, trạng thái, người làm, sprint, deadline, mô tả
4. Khi hỏi về tiến độ, phân tích dựa trên số liệu thống kê
5. Khi dự đoán tiến độ, dựa vào tốc độ hoàn thành hiện tại, số task còn lại, deadline
6. Sử dụng emoji phù hợp để làm câu trả lời sinh động
7. Nếu không tìm thấy thông tin, hãy nói rõ và gợi ý
8. Hỗ trợ tạo task: hỏi người dùng các thông tin cần thiết (tên, mô tả, ưu tiên, người làm, sprint, deadline)
9. Format câu trả lời dễ đọc, sử dụng bullet points, line breaks

SẴN SÀNG HỖ TRỢ!`;
  }

  getPriorityText(priority) {
    const priorities = {
      0: "Thấp",
      1: "Trung bình",
      2: "Cao",
      4: "Cần gấp",
    };
    return priorities[priority] || "N/A";
  }

  /**
   * Generate task description/summary based on user prompt
   */
  async generateTaskDescription(userId, projectId, userPrompt) {
    try {
      const prompt = `Bạn là trợ lý AI chuyên nghiệp hỗ trợ tạo mô tả cho task trong hệ thống quản lý dự án.

Yêu cầu của người dùng: ${userPrompt}

Hãy tạo một mô tả task chuyên nghiệp, chi tiết và rõ ràng dựa trên yêu cầu trên. Mô tả nên:
1. Viết dài một chút và chi tiết
2. Nêu rõ mục đích và kết quả mong đợi
3. Có thể bao gồm các bước thực hiện nếu cần
4. Viết bằng tiếng Việt
5. Viết chi tiết cả giải pháp, công nghệ đề xuất (nếu người dùng không yêu cầu viết ngôn ngữ gì)

Định dạng markdown ĐƠN GIẢN:
- Sử dụng **bold** cho nội dung quan trọng
- Sử dụng danh sách (- hoặc 1.) nếu cần liệt kê các bước
- Sử dụng \`code\` cho thuật ngữ kỹ thuật
- KHÔNG sử dụng code block (\`\`\`)
- KHÔNG sử dụng header (# ## ###)
- Mỗi đoạn văn cách nhau bằng một dòng trống

Chỉ trả về nội dung mô tả, không cần giải thích thêm.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return response;
    } catch (err) {
      console.error("AI description generation error:", err);
      throw new ApiError("Không thể tạo mô tả bằng AI", 500);
    }
  }

  /**
   * Generate AI summary for a specific task
   */
  async generateTaskSummary(userId, projectId, taskId) {
    try {
      // Get task details
      const task = await Task.findOne({
        where: { task_id: taskId, project_id: projectId },
        include: [
          {
            model: User,
            as: "assignee",
            attributes: ["user_id", "first_name", "last_name", "email"],
          },
          {
            model: User,
            as: "reporter",
            attributes: ["user_id", "first_name", "last_name"],
          },
          {
            model: ProjectStatus,
            as: "status",
            attributes: ["status_id", "name"],
          },
          {
            model: Sprint,
            as: "sprint",
            attributes: [
              "sprint_id",
              "name",
              "start_date",
              "end_date",
              "status",
            ],
          },
        ],
      });

      if (!task) {
        throw new ApiError("Không tìm thấy task", 404);
      }

      // Calculate progress
      const progress = task.estimate
        ? Math.round(((task.spent_time || 0) / task.estimate) * 100)
        : 0;

      const timeRemaining = task.estimate
        ? task.estimate - (task.spent_time || 0)
        : null;

      const isOverdue = task.due_date && new Date(task.due_date) < new Date();

      const daysUntilDue = task.due_date
        ? Math.ceil(
            (new Date(task.due_date).getTime() - new Date().getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : null;

      const prompt = `Bạn là trợ lý AI chuyên nghiệp hỗ trợ quản lý dự án. Hãy tạo một tóm tắt ngắn gọn và hữu ích về task sau:

📋 THÔNG TIN TASK:
ID: ${task.task_id}
Tên: ${task.title}
Mô tả: ${task.description || "Không có mô tả"}
Trạng thái: ${task.status?.name || "N/A"}
Loại: ${task.type || "N/A"}
Ưu tiên: ${this.getPriorityText(task.priority)}
Người thực hiện: ${
        task.assignee
          ? `${task.assignee.first_name} ${task.assignee.last_name}`
          : "Chưa assign"
      }
Người tạo: ${
        task.reporter
          ? `${task.reporter.first_name} ${task.reporter.last_name}`
          : "N/A"
      }
Sprint: ${task.sprint?.name || "N/A"}

⏱️ THỜI GIAN:
Ngày tạo: ${new Date(task.created_at).toLocaleDateString("vi-VN")}
Ngày bắt đầu: ${
        task.start_date
          ? new Date(task.start_date).toLocaleDateString("vi-VN")
          : "N/A"
      }
Deadline: ${
        task.due_date
          ? new Date(task.due_date).toLocaleDateString("vi-VN")
          : "N/A"
      }${
        isOverdue
          ? " ⚠️ QUÁ HẠN"
          : daysUntilDue !== null
          ? ` (còn ${daysUntilDue} ngày)`
          : ""
      }
Thời gian ước tính: ${task.estimate || 0}h
Thời gian đã dùng: ${task.spent_time || 0}h
Thời gian còn lại: ${timeRemaining !== null ? `${timeRemaining}h` : "N/A"}
Tiến độ: ${progress}%

Hãy tạo một tóm tắt ngắn gọn (3-5 câu) bao gồm:
1. Task này làm gì?
2. Trạng thái hiện tại và tiến độ
3. Những điểm cần lưu ý (deadline, ưu tiên, quá hạn, etc.)
4. Khuyến nghị hành động (nếu có)

Sử dụng emoji phù hợp và viết bằng tiếng Việt. Format dạng markdown dễ đọc.`;

      const result = await this.model.generateContent(prompt);
      const response = result.response.text();

      return {
        summary: response,
        taskInfo: {
          task_id: task.task_id,
          title: task.title,
          status: task.status?.name,
          priority: this.getPriorityText(task.priority),
          assignee: task.assignee
            ? `${task.assignee.first_name} ${task.assignee.last_name}`
            : "Chưa assign",
          progress: `${progress}%`,
          deadline: task.due_date
            ? new Date(task.due_date).toLocaleDateString("vi-VN")
            : "N/A",
          isOverdue,
        },
      };
    } catch (err) {
      console.error("AI task summary error:", err);
      throw new ApiError(
        err.message || "Không thể tạo tóm tắt task bằng AI",
        err.statusCode || 500
      );
    }
  }
}

module.exports = AiChatbotService;
