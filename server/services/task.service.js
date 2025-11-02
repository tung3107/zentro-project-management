const { Op, fn, col } = require("sequelize");
const Member = require("../models/Member");
const Role = require("../models/Role");
const Task = require("../models/Task");
const ProjectStatus = require("../models/ProjectStatus");

const Comment = require("../models/Comment");
const Attachment = require("../models/Attachment");
const TaskLabel = require("../models/TaskLabel");

const User = require("../models/User");
const ApiError = require("../utils/ApiError");
const { sequelize } = require("../config/database");
const Sprint = require("../models/Sprint");

class TaskService {
  async updateOneTask(task_id, user_id, body) {
    try {
      //  Tìm task
      const task = await Task.findByPk(task_id);
      if (!task) throw new ApiError("Task not found", 400);

      const isMember = await Member.findOne({
        where: { user_id: user_id, project_id: task.project_id },
      });

      if (!isMember) {
        throw new ApiError(
          `Bạn không có quyền truy cập vào trang web này`,
          403
        );
      }

      await Task.update(body, { where: { task_id: task_id } });

      return "Sửa thành công thành công";
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      } else {
        throw new ApiError(`Error: ${err.message}`, 400);
      }
    }
  }
  async deleteOneTask(task_id, user_id) {
    try {
      //  Tìm task
      const task = await Task.findByPk(task_id);
      if (!task) throw new ApiError("Task not found", 400);

      /// Tim xem user co quyen truy cap vao task khong

      const isMember = await Member.findOne({
        where: { user_id: user_id, project_id: task.project_id },
      });

      if (!isMember) {
        throw new ApiError(
          `Bạn không có quyền truy cập vào trang web này`,
          403
        );
      }

      await sequelize.transaction(async (t) => {
        await Comment.destroy({ where: { task_id: task_id }, transaction: t });
        await Attachment.destroy({
          where: { task_id: task_id },
          transaction: t,
        });
        await TaskLabel.destroy({
          where: { task_id: task_id },
          transaction: t,
        });

        await Task.destroy({ where: { task_id: task_id }, transaction: t });
      });

      return "Xóa thành công";
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      } else {
        throw new ApiError(`Error: ${err.message}`, 400);
      }
    }
  }
  async getOneTask(task_id, user_id) {
    try {
      //  Tìm task
      const task = await Task.findByPk(task_id, {
        include: [
          {
            model: User,
            as: "assignee",
            attributes: [
              "user_id",
              "first_name",
              "last_name",
              "avatar",
              "email",
            ],
          },
          {
            model: Task,
            as: "subtasks",
            include: [
              {
                model: User,
                as: "assignee",
                attributes: [
                  "user_id",
                  "first_name",
                  "last_name",
                  "avatar",
                  "email",
                ],
              },
              {
                model: ProjectStatus,
                as: "status",
                attributes: ["status_id", "name", "color"],
              },
            ],
            order: [["created_at", "ASC"]],
          },
        ],
      });

      if (!task) throw new ApiError("Task not found", 400);

      /// Tim xem user co quyen truy cap vao task khong

      const isMember = await Member.findOne({
        where: { user_id: user_id, project_id: task.project_id },
      });

      const isAdmin = await User.findOne({
        where: { user_id: user_id },
        include: [
          { model: Role, where: { role_name: { [Op.like]: "%Admin%" } } },
        ],
      });

      if (!isMember && !isAdmin) {
        throw new ApiError(
          `Bạn không có quyền truy cập vào trang web này`,
          403
        );
      }

      return task;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      } else {
        throw new ApiError(`Error: ${err.message}`, 400);
      }
    }
  }

  async getBackLog_TaskBySprint(user_id, project_id) {
    try {
      const result = {};

      const isMember = await Member.findOne({
        where: { user_id: user_id, project_id: project_id },
      });

      if (!isMember) {
        throw new ApiError(
          `Bạn không có quyền truy cập vào trang web này`,
          403
        );
      }
      //// Lay task backlog
      const backlog = await Task.findAll({
        where: {
          sprint_id: null,
          type: { [Op.ne]: "subtask" }, // Không lấy subtasks
        },
        order: [["created_at", "ASC"]],
        include: [
          {
            model: User,
            as: "assignee",
            attributes: [
              [
                fn("CONCAT", col("first_name"), " ", col("last_name")),
                "assignee_name",
              ],
              "email",
              "avatar",
            ],
          },
        ],
        attributes: [
          "task_id",
          "title",
          "status_id",
          "priority",
          "assignee_id",
          "type",
          "due_date",
        ],
      });

      /// Lay sprints
      const sprints = await Sprint.findAll({
        where: { project_id: project_id },
        include: [
          {
            model: Task,
            as: "tasks",
            where: {
              type: { [Op.ne]: "subtask" }, // Không lấy subtasks
            },
            include: [
              {
                model: User,
                as: "assignee",
                attributes: [
                  [
                    fn("CONCAT", col("first_name"), " ", col("last_name")),
                    "assignee_name",
                  ],
                  "email",
                  "avatar",
                ],
              },
            ],
            attributes: [
              "task_id",
              "title",
              "status_id",
              "priority",
              "assignee_id",
              "type",
              "due_date",
            ],
          },
        ],
      });

      return {
        backlog: { tasks: backlog },
        sprints,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  async searchTaskBackLog(user_id, project_id, query) {
    try {
      const result = {};

      const isMember = await Member.findOne({
        where: { user_id, project_id },
      });

      if (!isMember) {
        throw new ApiError(
          `Bạn không có quyền truy cập vào trang web này`,
          403
        );
      }

      // 👇 Tạo điều kiện where động
      const backlogWhere = {
        sprint_id: null,
        type: { [Op.ne]: "subtask" }, // Không lấy subtasks
        ...(query ? { title: { [Op.like]: `%${query}%` } } : {}), // chỉ thêm điều kiện nếu có query
      };

      const backlog = await Task.findAll({
        where: backlogWhere,
        order: [["created_at", "DESC"]],
        include: [
          {
            model: User,
            as: "assignee",
            attributes: [
              [
                fn("CONCAT", col("first_name"), " ", col("last_name")),
                "assignee_name",
              ],
              "email",
              "avatar",
            ],
          },
        ],
        attributes: [
          "task_id",
          "title",
          "status_id",
          "priority",
          "assignee_id",
          "type",
          "due_date",
        ],
      });

      // 🧠 Tạo điều kiện where cho Sprint.tasks
      const sprintTaskWhere = {
        type: { [Op.ne]: "subtask" }, // Không lấy subtasks
        ...(query ? { title: { [Op.like]: `%${query}%` } } : {}), // Nếu query rỗng thì không lọc theo title
      };

      const sprints = await Sprint.findAll({
        where: { project_id },
        include: [
          {
            model: Task,
            as: "tasks",
            where: sprintTaskWhere,
            required: false, // 👈 tránh mất sprint nếu query rỗng
            include: [
              {
                model: User,
                as: "assignee",
                attributes: [
                  [
                    fn("CONCAT", col("first_name"), " ", col("last_name")),
                    "assignee_name",
                  ],
                  "email",
                  "avatar",
                ],
              },
            ],
            attributes: [
              "task_id",
              "title",
              "status_id",
              "priority",
              "assignee_id",
              "type",
              "due_date",
            ],
          },
        ],
      });

      return {
        backlog: { tasks: backlog },
        sprints,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  async createTask(user_id, body) {
    try {
      const isMember = await Member.findOne({
        where: { user_id: user_id, project_id: body.project_id },
      });

      if (!isMember) {
        throw new ApiError(
          `Bạn không có quyền truy cập vào trang web này`,
          403
        );
      }

      const data = await Task.create(body);

      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      } else {
        throw new ApiError(`Error: ${err.message}`, 400);
      }
    }
  }

  async getTaskForBoard(user_id, project_id) {
    try {
      const isMember = await Member.findOne({
        where: { user_id: user_id, project_id: project_id },
      });

      const isAdmin = await User.findOne({
        where: { user_id: user_id },
        include: [
          { model: Role, where: { role_name: { [Op.like]: "%Admin%" } } },
        ],
      });

      if (!isMember && !isAdmin) {
        throw new ApiError(
          `Bạn không có quyền truy cập vào trang web này`,
          403
        );
      }
      const data = await ProjectStatus.findAll({
        where: { project_id: project_id },
        attributes: [
          ["status_id", "id"],
          ["name", "title"],
        ],
        include: [
          {
            model: Task,
            as: "tasks",
            where: {
              type: { [Op.ne]: "subtask" }, // Không lấy subtasks
            },
            include: [
              {
                model: Sprint,
                as: "sprint",
                where: { status: "active" },
                attributes: [],
              },
            ],
          },
        ],
      });

      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      } else {
        throw new ApiError(`Error: ${err.message}`, 400);
      }
    }
  }

  /**
   * Get tasks for board - grouped by status columns
   */
  async getTaskForBoard(user_id, project_id) {
    try {
      const isMember = await Member.findOne({
        where: { user_id: user_id, project_id: project_id },
      });

      if (!isMember) {
        throw new ApiError(
          `Bạn không có quyền truy cập vào trang web này`,
          403
        );
      }

      // Get current active sprint
      const activeSprint = await Sprint.findOne({
        where: {
          project_id: project_id,
          status: "active",
        },
      });

      if (!activeSprint) {
        return []; // No active sprint, return empty board
      }

      // Get all statuses for this project
      const statuses = await ProjectStatus.findAll({
        where: { project_id: project_id },
        order: [["status_id", "ASC"]],
      });

      // Get all tasks in the active sprint
      const tasks = await Task.findAll({
        where: {
          project_id: project_id,
          sprint_id: activeSprint.sprint_id,
          type: { [Op.ne]: "subtask" }, // Không lấy subtasks
        },
        include: [
          {
            model: User,
            as: "assignee",
            attributes: ["user_id", "first_name", "last_name", "avatar"],
          },
          {
            model: User,
            as: "reporter",
            attributes: ["user_id", "first_name", "last_name"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      // Group tasks by status
      const columns = statuses.map((status) => ({
        id: status.status_id,
        title: status.name,
        color: status.color,
        tasks: tasks.filter((task) => task.status_id === status.status_id),
      }));

      return columns;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  /**
   * Search tasks in board
   */
  async searchTaskForBoard(user_id, project_id, query, filters = {}) {
    try {
      const isMember = await Member.findOne({
        where: { user_id: user_id, project_id: project_id },
      });

      if (!isMember) {
        throw new ApiError(
          `Bạn không có quyền truy cập vào trang web này`,
          403
        );
      }

      // Get current active sprint
      const activeSprint = await Sprint.findOne({
        where: {
          project_id: project_id,
          status: "active",
        },
      });

      if (!activeSprint) {
        return [];
      }

      // Build where clause for tasks
      const taskWhere = {
        project_id: project_id,
        sprint_id: activeSprint.sprint_id,
        type: { [Op.ne]: "subtask" }, // Không lấy subtasks
      };

      // Add search query
      if (query && query.trim()) {
        taskWhere.title = { [Op.like]: `%${query}%` };
      }

      // Add filters
      if (filters.assignee_id) {
        taskWhere.assignee_id = filters.assignee_id;
      }
      if (filters.priority !== undefined && filters.priority !== null) {
        taskWhere.priority = filters.priority;
      }
      if (filters.type) {
        taskWhere.type = filters.type;
      }

      // Get all statuses for this project
      const statuses = await ProjectStatus.findAll({
        where: { project_id: project_id },
        order: [["status_id", "ASC"]],
      });

      // Get filtered tasks
      const tasks = await Task.findAll({
        where: taskWhere,
        include: [
          {
            model: User,
            as: "assignee",
            attributes: ["user_id", "first_name", "last_name", "avatar"],
          },
          {
            model: User,
            as: "reporter",
            attributes: ["user_id", "first_name", "last_name"],
          },
        ],
        order: [["created_at", "DESC"]],
      });

      // Group tasks by status
      const columns = statuses.map((status) => ({
        id: status.status_id,
        title: status.name,
        color: status.color,
        tasks: tasks.filter((task) => task.status_id === status.status_id),
      }));

      return columns;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  /**
   * Get burndown chart data for active sprint
   */
  async getBurndownChart(project_id) {
    try {
      // Get current active sprint
      const activeSprint = await Sprint.findOne({
        where: {
          project_id: project_id,
          status: "active",
        },
      });

      if (!activeSprint) {
        throw new ApiError("Không có sprint đang hoạt động", 404);
      }

      const statuses = await ProjectStatus.findAll({
        where: { project_id },
        attributes: ["status_id", "name"],
      });

      // Get all tasks in sprint
      const tasks = await Task.findAll({
        where: {
          project_id: project_id,
          sprint_id: activeSprint.sprint_id,
        },
        attributes: ["task_id", "estimate", "spent_time", "status_id"],
        include: [
          {
            model: ProjectStatus,
            as: "status",
            attributes: ["name"],
          },
        ],
      });

      const statusMap = Object.fromEntries(
        statuses.map((s) => [s.status_id, s.name])
      );

      // Calculate sprint duration
      const startDate = new Date(activeSprint.start_date);
      const endDate = new Date(activeSprint.end_date);
      const today = new Date();
      const totalDays = Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Calculate ideal burndown line
      const totalEstimate = tasks.reduce(
        (sum, task) => sum + (task.estimate || 0),
        0
      );
      const idealBurndownPerDay = totalEstimate / totalDays;

      // Calculate remaining work per day
      const burndownData = [];
      for (let day = 0; day <= totalDays; day++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(currentDate.getDate() + day);

        // Only calculate up to today
        if (currentDate > today && day > 0) break;

        // Ideal remaining work
        const idealRemaining = Math.max(
          0,
          totalEstimate - idealBurndownPerDay * day
        );

        // Actual remaining work (tasks not completed)
        // For simplicity, we'll calculate based on current state
        // In a real app, you'd track daily completion
        const completedTasks = tasks.filter((t) => {
          const statusName = statusMap[t.status_id]?.toLowerCase() || "";
          return statusName.includes("hoàn thành");
        });

        const completedEstimate = completedTasks.reduce(
          (sum, task) => sum + (task.estimate || 0),
          0
        );
        const actualRemaining = totalEstimate - completedEstimate;

        burndownData.push({
          date: currentDate.toISOString().split("T")[0],
          ideal: Math.round(idealRemaining * 10) / 10,
          actual:
            day ===
            Math.min(
              totalDays,
              Math.ceil(
                (today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
              )
            )
              ? Math.round(actualRemaining * 10) / 10
              : null, // Only show actual for current day
        });
      }

      return {
        sprint: {
          name: activeSprint.name,
          start_date: activeSprint.start_date,
          end_date: activeSprint.end_date,
        },
        totalEstimate,
        completedEstimate: tasks
          .filter((t) => {
            const statusName = statusMap[t.status_id]?.toLowerCase() || "";
            return statusName.includes("hoàn thành");
          })
          .reduce((sum, t) => sum + (t.estimate || 0), 0),
        burndownData,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  /**
   * Get tasks for calendar view by month
   * @param {string} project_id - Project ID
   * @param {number} year - Year (e.g., 2025)
   * @param {number} month - Month (1-12)
   * @param {string} assignee_id - Optional filter by assignee
   * @returns {Array} Tasks for the specified month
   */
  async getTasksByMonth(project_id, year, month, assignee_id) {
    try {
      // Create start and end dates for the month
      const startDate = new Date(year, month - 1, 1); // month is 0-indexed
      const endDate = new Date(year, month, 0); // Last day of month

      // Build where clause
      const whereClause = {
        project_id,
        type: { [Op.ne]: "subtask" }, // Không lấy subtasks
        [Op.or]: [
          {
            due_date: {
              [Op.between]: [startDate, endDate],
            },
          },
          {
            start_date: {
              [Op.between]: [startDate, endDate],
            },
          },
        ],
      };

      if (assignee_id) {
        whereClause.assignee_id = assignee_id;
      }

      const tasks = await Task.findAll({
        where: whereClause,
        include: [
          {
            model: ProjectStatus,
            as: "status",
            attributes: ["status_id", "name", "color"],
          },
          {
            model: User,
            as: "assignee",
            attributes: ["user_id", "first_name", "last_name", "avatar"],
          },
        ],
        order: [["due_date", "ASC"]],
      });

      return tasks.map((task) => ({
        task_id: task.task_id,
        title: task.title,
        description: task.description,
        type: task.type,
        priority: task.priority,
        status_id: task.status_id,
        status: task.status
          ? {
              status_id: task.status.status_id,
              name: task.status.name,
              color: task.status.color,
            }
          : null,
        assignee_id: task.assignee_id,
        assignee: task.assignee
          ? {
              user_id: task.assignee.user_id,
              first_name: task.assignee.first_name,
              last_name: task.assignee.last_name,
              avatar: task.assignee.avatar,
            }
          : null,
        start_date: task.start_date,
        due_date: task.due_date,
        estimate: task.estimate,
        spent_time: task.spent_time,
        created_at: task.created_at,
        updated_at: task.updated_at,
      }));
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }
}

module.exports = TaskService;
