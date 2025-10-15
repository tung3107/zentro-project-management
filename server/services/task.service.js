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
      const task = await Task.findByPk(task_id);
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
        where: { sprint_id: null },
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
        where: { user_id: user_id, project_id: project_id },
      });

      if (!isMember) {
        throw new ApiError(
          `Bạn không có quyền truy cập vào trang web này`,
          403
        );
      }

      const backlog = await Task.findAll({
        where: { sprint_id: null, title: { [Op.like]: `%${query}%` } },
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

      /// Lay sprints
      const sprints = await Sprint.findAll({
        where: { project_id: project_id },
        include: [
          {
            model: Task,
            as: "tasks",
            where: { title: { [Op.like]: `%${query}%` } },
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
}

module.exports = TaskService;
