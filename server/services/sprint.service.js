const { where, Op } = require("sequelize");
const { sequelize } = require("../config/database");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const Task = require("../models/Task");
const ActivityLog = require("../models/ActivityLog");
const ApiError = require("../utils/ApiError");
const ProjectStatus = require("../models/ProjectStatus");
const notificationService = require("./notification.service");

class SprintService {
  async getCurrentSprintDetails(project_id) {
    try {
      const activeSprint = await Sprint.findOne({
        where: { project_id, status: "active" },
      });

      if (!activeSprint)
        throw new ApiError("Không có Sprint nào đang chạy", 400);

      return activeSprint;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  async getOneSprint(sprint_id) {
    try {
      const activeSprint = await Sprint.findOne({
        where: { sprint_id: sprint_id },
      });

      if (!activeSprint)
        throw new ApiError("Không có Sprint nào đang chạy", 400);

      return activeSprint;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${err.message}`, 400);
      }
    }
  }

  async getAllSprints(project_id) {
    try {
      const sprints = await Sprint.findAll({
        where: { project_id: project_id },
        order: [["start_date", "DESC"]],
        attributes: [
          "sprint_id",
          "project_id",
          "name",
          "goal",
          "start_date",
          "end_date",
          "status",
          "velocity_estimate",
        ],
      });

      return sprints;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async createSprint_planned_status(user_id, body) {
    try {
      const findProject = await Project.findByPk(body.project_id);

      if (!findProject) throw new ApiError("Project không tồn tại", 400);

      const result = await Sprint.findOne({
        where: { project_id: body.project_id, name: body.name },
      });

      if (result) throw new ApiError("Tên sprint đã trùng, chọn tên khác", 400);

      const data = await Sprint.create(body);

      await ActivityLog.create({
        project_id: data.project_id,
        user_id: user_id,
        entity_type: "sprint",
        entity_id: data.sprint_id,
        action_type: "create",
        old_value: null,
        new_value: {
          sprint_id: data.sprint_id,
          name: data.name,
          start_date: data.start_date,
          end_date: data.end_date,
        },
        message_template: "đã tạo sprint {{entity_id}}",
      });

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  async startSprint(user_id, sprint_id, body) {
    try {
      const result = await Sprint.findByPk(sprint_id);

      if (!result) throw new ApiError("Sprint kkhông tồn tại", 400);

      const existingActiveSprint = await Sprint.findOne({
        where: {
          project_id: body.project_id,
          status: "active",
          sprint_id: { [Op.ne]: sprint_id },
        },
      });

      if (existingActiveSprint) {
        throw new ApiError(
          "Chỉ được phép có 1 giai đoạn đang chạy trong 1 dự án!",
          400
        );
      }
      const data = { ...body, status: "active" };
      await Sprint.update(data, { where: { sprint_id: sprint_id } });

      await ActivityLog.create({
        project_id: result.project_id,
        user_id: user_id,
        entity_type: "sprint",
        entity_id: sprint_id,
        action_type: "start",
        old_value: null,
        new_value: {
          sprint_id: sprint_id,
          name: result.name,
        },
        message_template: "đã bắt đầu sprint {{entity_id}}",
      });

      // Send notification to project members
      await notificationService.notifySprintStarted(
        sprint_id,
        result.project_id,
        user_id
      );

      return "Start sprint thành công";
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  async checkCompleteSprint(sprint_id) {
    try {
      const result = await Sprint.findByPk(sprint_id);
      if (!result) throw new ApiError("Sprint không tồn tại", 400);

      const tasks = await Task.findAll({
        where: { sprint_id: sprint_id },
        include: [
          {
            model: ProjectStatus,
            as: "status",
            attributes: ["status_id", "name"],
          },
          {
            model: Task, // subtask
            as: "subtasks",
            include: [
              {
                model: ProjectStatus,
                as: "status",
                attributes: ["status_id", "name"],
              },
            ],
          },
        ],
      });

      const flattenTasks = (taskList) => {
        return taskList.map((task) => ({
          task_id: task.task_id,
          title: task.title,
          type: task.type,
          assignee: task.assignee,
          status: task.status,
          subtasks:
            task.subtasks?.map((sub) => ({
              task_id: sub.task_id,
              title: sub.title,
              type: sub.type,
              assignee: sub.assignee,
              status: sub.status,
            })) || [],
        }));
      };

      const allTasks = flattenTasks(tasks);

      const completedTasks = allTasks.filter(
        (task) => task.status.name === "Hoàn thành"
      );
      const incompleteTasks = allTasks.filter(
        (task) => task.status.name !== "Hoàn thành"
      );

      return { completedTasks, incompleteTasks };
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async completeSprint(user_id, sprint_id, incompleteTasks = []) {
    try {
      const result = await Sprint.findByPk(sprint_id);

      if (!result) throw new ApiError("Sprint không tồn tại", 400);

      const data = { status: "completed" };

      // Use transaction to ensure all operations succeed or fail together
      await sequelize.transaction(async (t) => {
        // Update sprint status
        await Sprint.update(data, {
          where: { sprint_id: sprint_id },
          transaction: t,
        });

        // Handle incomplete tasks
        if (incompleteTasks && incompleteTasks.length > 0) {
          for (const taskAction of incompleteTasks) {
            const { taskId, action, targetSprintId } = taskAction;

            if (action === "backlog") {
              // Move to backlog (sprint_id = null)
              await Task.update(
                { sprint_id: null },
                { where: { task_id: taskId }, transaction: t }
              );
            } else if (action === "nextSprint" && targetSprintId) {
              // Move to another sprint
              await Task.update(
                { sprint_id: targetSprintId },
                { where: { task_id: taskId }, transaction: t }
              );
            }
          }
        }

        // Log activity
        await ActivityLog.create(
          {
            project_id: result.project_id,
            user_id: user_id,
            entity_type: "sprint",
            entity_id: sprint_id,
            action_type: "complete",
            old_value: null,
            new_value: {
              sprint_id: sprint_id,
              name: result.name,
              incompleteTasksCount: incompleteTasks.length,
            },
            message_template: "đã hoàn thành sprint {{entity_id}}",
          },
          { transaction: t }
        );
      });

      // Send notification to project members
      await notificationService.notifySprintCompleted(
        sprint_id,
        result.project_id,
        user_id
      );

      return "Complete sprint thành công";
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  async updateSprint(sprint_id, body) {
    try {
      const result = await Sprint.findByPk(sprint_id);

      if (!result) throw new ApiError("Sprint kkhông tồn tại", 400);

      await Sprint.update(body, { where: { sprint_id: sprint_id } });

      return "Edit sprint thành công";
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async deleteSprint(sprint_id) {
    try {
      const result = await Sprint.findByPk(sprint_id);

      if (!result) throw new ApiError("Sprint kkhông tồn tại", 400);

      await sequelize.transaction(async (t) => {
        await Task.update(
          { sprint_id: null },
          { where: { sprint_id: sprint_id }, transaction: t }
        );

        await Sprint.destroy({
          where: { sprint_id: sprint_id },
          transaction: t,
        });
      });
      return "Xóa thành công";
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }
}

module.exports = SprintService;
