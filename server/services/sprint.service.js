const { where } = require("sequelize");
const { sequelize } = require("../config/database");
const Project = require("../models/Project");
const Sprint = require("../models/Sprint");
const Task = require("../models/Task");
const ApiError = require("../utils/ApiError");

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

  async createSprint_planned_status(body) {
    try {
      const findProject = await Project.findByPk(body.project_id);

      if (!findProject) throw new ApiError("Project không tồn tại", 400);

      const result = await Sprint.findOne({
        where: { project_id: body.project_id, name: body.name },
      });

      if (result) throw new ApiError("Tên sprint đã trùng, chọn tên khác", 400);

      const data = await Sprint.create(body);

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  async startSprint(sprint_id, body) {
    try {
      const result = await Sprint.findByPk(sprint_id);

      if (!result) throw new ApiError("Sprint kkhông tồn tại", 400);

      const isActiveSprintExist = await Sprint.findOne({
        where: { project_id: body.project_id, sprint_id },
      });

      if (isActiveSprintExist)
        throw new ApiError("Chỉ được bắt đầu 1 sprint trong 1 thời điểm", 400);

      const data = { ...body, status: "active" };

      await Sprint.update(data, { where: { sprint_id: sprint_id } });

      return "Start sprint thành công";
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      } else {
        throw new ApiError(`Error: ${error.message}`, 400);
      }
    }
  }

  async completeSprint(sprint_id, body) {
    try {
      const result = await Sprint.findByPk(sprint_id);

      if (!result) throw new ApiError("Sprint kkhông tồn tại", 400);

      const data = { ...body, status: "active" };

      await Sprint.update(data, { where: { sprint_id: sprint_id } });

      return "Start sprint thành công";
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
