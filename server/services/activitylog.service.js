const ActivityLog = require("../models/ActivityLog");
const User = require("../models/User");
const Task = require("../models/Task");
const ProjectStatus = require("../models/ProjectStatus");
const Sprint = require("../models/Sprint");
const ApiError = require("../utils/ApiError");

const { Op } = require("sequelize");

class ActivityLogService {
  async getActivityLogForProject(project_id, period, page = 1, limit = 10) {
    try {
      // Convert to numbers to avoid SQL syntax errors
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;

      const whereClause = { project_id: project_id };

      if (period) {
        const date = new Date();
        if (period === "1d") {
          date.setDate(date.getDate() - 1);
        } else if (period === "7d") {
          date.setDate(date.getDate() - 7);
        } else if (period === "30d") {
          date.setDate(date.getDate() - 30);
        }
        whereClause.created_at = {
          [Op.gte]: date,
        };
      }

      const offset = (pageNum - 1) * limitNum;

      const { count, rows } = await ActivityLog.findAndCountAll({
        where: whereClause,
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
        order: [["created_at", "DESC"]],
        offset,
        limit: limitNum,
      });

      const enrichedActivities = await Promise.all(
        rows.map(async (log) => {
          const logData = log.toJSON();

          let oldValue = logData.old_value;
          let newValue = logData.new_value;

          if (typeof oldValue === "string") {
            try {
              oldValue = JSON.parse(oldValue);
            } catch (e) {
              oldValue = {};
            }
          }

          if (typeof newValue === "string") {
            try {
              newValue = JSON.parse(newValue);
            } catch (e) {
              newValue = {};
            }
          }

          oldValue = oldValue || {};
          newValue = newValue || {};

          if (logData.entity_type === "task" && logData.entity_id) {
            const task = await Task.findByPk(logData.entity_id, {
              attributes: ["task_id", "title", "type"],
            });
            if (task) {
              logData.task = {
                task_id: task.task_id,
                title: task.title,
                type: task.type,
              };
            }
          }

          if (logData.entity_type === "sprint" && logData.entity_id) {
            const sprint = await Sprint.findByPk(logData.entity_id, {
              attributes: [
                "sprint_id",
                "name",
                "start_date",
                "end_date",
                "status",
              ],
            });
            if (sprint) {
              logData.sprint = {
                sprint_id: sprint.sprint_id,
                name: sprint.name,
                start_date: sprint.start_date,
                end_date: sprint.end_date,
                status: sprint.status,
              };
            }
          }

          // Resolve old and new values
          const resolvedOld = await this.resolveLogValues(oldValue);
          const resolvedNew = await this.resolveLogValues(newValue);

          return {
            ...logData,
            old_value_resolved: resolvedOld,
            new_value_resolved: resolvedNew,
          };
        })
      );

      return {
        totalItems: count,
        totalPages: Math.ceil(count / limitNum),
        currentPage: pageNum,
        activities: enrichedActivities,
      };
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  async getActivityLogForTask(project_id, task_id) {
    try {
      const logs = await ActivityLog.findAll({
        where: {
          project_id: project_id,
          entity_id: task_id,
          entity_type: "task",
        },
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
        order: [["created_at", "DESC"]],
      });

      if (!logs) {
        throw new ApiError("Task not found", 400);
      }

      const enrichedLogs = await Promise.all(
        logs.map(async (log) => {
          const logData = log.toJSON();

          let oldValue = logData.old_value;
          let newValue = logData.new_value;

          if (typeof oldValue === "string") {
            try {
              oldValue = JSON.parse(oldValue);
            } catch (e) {
              oldValue = {};
            }
          }

          if (typeof newValue === "string") {
            try {
              newValue = JSON.parse(newValue);
            } catch (e) {
              newValue = {};
            }
          }

          oldValue = oldValue || {};
          newValue = newValue || {};

          // Resolve task details
          if (logData.entity_type === "task" && logData.entity_id) {
            const task = await Task.findByPk(logData.entity_id, {
              attributes: ["task_id", "title", "type"],
            });
            if (task) {
              logData.task = {
                task_id: task.task_id,
                title: task.title,
                type: task.type,
              };
            }
          }

          // Resolve sprint details
          if (logData.entity_type === "sprint" && logData.entity_id) {
            const sprint = await Sprint.findByPk(logData.entity_id, {
              attributes: [
                "sprint_id",
                "name",
                "start_date",
                "end_date",
                "status",
              ],
            });
            if (sprint) {
              logData.sprint = {
                sprint_id: sprint.sprint_id,
                name: sprint.name,
                start_date: sprint.start_date,
                end_date: sprint.end_date,
                status: sprint.status,
              };
            }
          }

          // Resolve old and new values
          const resolvedOld = await this.resolveLogValues(oldValue);
          const resolvedNew = await this.resolveLogValues(newValue);

          return {
            ...logData,
            old_value_resolved: resolvedOld,
            new_value_resolved: resolvedNew,
          };
        })
      );

      return enrichedLogs;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  /**
   * Resolve IDs in log values to human-readable names
   */
  async resolveLogValues(values) {
    if (!values || typeof values !== "object") return values;

    const resolved = { ...values };

    // Resolve status_id
    if (values.status_id) {
      const status = await ProjectStatus.findByPk(values.status_id, {
        attributes: ["status_id", "name", "color"],
      });
      if (status) {
        resolved.status = {
          id: status.status_id,
          name: status.name,
          color: status.color,
        };
      }
    }

    // Resolve sprint_id
    if (values.sprint_id) {
      const sprint = await Sprint.findByPk(values.sprint_id, {
        attributes: ["sprint_id", "name"],
      });
      if (sprint) {
        resolved.sprint = {
          id: sprint.sprint_id,
          name: sprint.name,
        };
      }
    }

    // Resolve assignee_id
    if (values.assignee_id) {
      const assignee = await User.findByPk(values.assignee_id, {
        attributes: ["user_id", "first_name", "last_name", "avatar"],
      });
      if (assignee) {
        resolved.assignee = {
          id: assignee.user_id,
          name: `${assignee.first_name} ${assignee.last_name}`,
          avatar: assignee.avatar,
        };
      }
    }

    // Resolve reporter_id
    if (values.reporter_id) {
      const reporter = await User.findByPk(values.reporter_id, {
        attributes: ["user_id", "first_name", "last_name", "avatar"],
      });
      if (reporter) {
        resolved.reporter = {
          id: reporter.user_id,
          name: `${reporter.first_name} ${reporter.last_name}`,
          avatar: reporter.avatar,
        };
      }
    }

    return resolved;
  }
}

module.exports = ActivityLogService;
