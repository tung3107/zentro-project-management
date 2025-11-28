const Project = require("../models/Project");
const ProjectStatus = require("../models/ProjectStatus");

const ApiError = require("../utils/ApiError");

class ProjectStatusService {
  async getProjectStatus(project_id) {
    try {
      const isExist = await Project.findByPk(project_id);

      if (!isExist) throw new ApiError("Không tìm thấy project_id", 400);

      const data = await ProjectStatus.findAll({
        where: { project_id: project_id },
        attributes: [
          ["status_id", "id"],
          "name",
          "color",
          "background",
          "border_color",
        ],
      });

      return data;
    } catch (error) {
      if (err instanceof ApiError) {
        throw err;
      } else {
        throw new ApiError(`Error: ${err.message}`, 400);
      }
    }
  }
}

module.exports = ProjectStatusService;
