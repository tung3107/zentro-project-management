const { Op, where, literal, fn, col } = require("sequelize");
const Project = require("../models/Project");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const { getAllWithParams } = require("../utils/queryBuilder");
const Member = require("../models/Member");
const { uploadImg } = require("../utils/uploadImg");
const Role = require("../models/Role");
const { sequelize } = require("../config/database");

class ProjectService {
  async getProjectListByUser(user_id) {
    try {
      const projects = await Project.findAll({
        include: [
          {
            model: Member,
            as: "members",
            where: { user_id },
            attributes: ["role_id"], // lấy ra role_id của thành viên này trong dự án
            include: [
              {
                model: Role,
                as: "role",
                attributes: ["role_name"], // lấy tên role
              },
            ],
          },
        ],
      });
      return projects;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async deleteOneProject(project_id) {
    try {
      const data = await Project.findByPk(project_id);

      if (!data) throw new ApiError("Không tìm thấy ID", 400);

      await sequelize.transaction(async (t) => {
        await Member.destroy({
          where: { project_id: project_id },
          transaction: t,
        });

        await Project.destroy({
          where: { project_id: project_id },
          transaction: t,
        });
      });
      return "Xóa thành công";
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }
  async getOneProject(project_id) {
    try {
      const data = await Project.findOne({
        project_id: project_id,
      });
      return data;
    } catch (err) {
      throw new ApiError(`Error: ${err.message}`, 400);
    }
  }

  async updateOneProject(project_id, body) {
    try {
      let avatar = null;

      if (body.file) {
        avatar = await uploadImg(body.file);
      }

      const projectData = { ...body, avatar: avatar };

      const [count] = await Project.update(projectData, {
        where: { project_id: project_id },
      });

      const data = await Project.findByPk(project_id);

      return data;
    } catch (err) {
      throw new ApiError(`Error: ${err.message}`, 400);
    }
  }
  async createOneProject(body) {
    try {
      let avatar = null;

      if (body.file) {
        avatar = await uploadImg(body.file);
      }

      const projectData = { ...body, avatar: avatar };

      const data = await Project.create(projectData);

      return data;
    } catch (err) {
      throw new ApiError(`Error: ${err.message}`, 400);
    }
  }

  /**
   * Get projects with pagination, sorting, filtering and search
   * @param {Object} options - Query options
   * @returns {Object} - Paginated project list with metadata
   */
  async getAllProjectsWithParam(options = {}) {
    const { leader_id, ...rest } = options;
    const roleNames = ["Leader", "Project Manager"];

    const result = await getAllWithParams(Project, rest, {
      defaultSortBy: "project_id",
      searchFields: ["project_name", "description", "project_id"],
      sortFields: ["project_id", "status", "start_date", "end_date"],
      include: [
        {
          model: Member,
          as: "members",
          required: false,
          separate: true,
          include: [
            {
              model: Role,
              as: "role",
              required: false,
              where: roleNames.length
                ? { role_name: { [Op.in]: roleNames } }
                : undefined,
              attributes: ["role_name"],
            },
            {
              model: User,
              as: "user",
              required: false, // ⚠ Không cần required ở đây
              attributes: ["user_id", "first_name", "last_name"],
            },
          ],
        },
      ],
    });

    // 💫 Tạo thêm leader_name
    result.data = result.data
      .map((project) => {
        const leaderMembers = project.members.filter(
          (m) =>
            m.role &&
            roleNames.includes(m.role.role_name) &&
            (!leader_id || m.user?.user_id === leader_id) // 💥 lọc leader_id ở đây
        );

        const leader = leaderMembers[0];
        const leader_name = leader
          ? `${leader.user?.first_name || ""} ${
              leader.user?.last_name || ""
            }`.trim()
          : null;

        return {
          ...project.toJSON(),
          leader_name,
          members: leaderMembers,
        };
      })
      // ⚡ lọc luôn các project không có leader phù hợp
      .filter((p) => !leader_id || p.leader_name);

    return result;
  }
}

module.exports = ProjectService;
