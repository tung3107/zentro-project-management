const { Op, where, literal, fn, col } = require("sequelize");
const Project = require("../models/Project");
const StatusTemplate = require("../models/StatusTemplate");
const ProjectStatus = require("../models/ProjectStatus");

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
            where: { user_id, is_delete: 0 },
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
  async getOneProject(user_id, project_id) {
    try {
      const isMember = await Member.findOne({
        where: { user_id: user_id, project_id: project_id, is_delete: 0 },
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

      const data = await Project.findOne({
        where: {
          project_id: project_id,
        },
      });
      return data;
    } catch (err) {
      if (err instanceof ApiError) {
        throw err;
      } else {
        throw new ApiError(`Error: ${err.message}`, 500);
      }
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

      const status_template = await StatusTemplate.findAll({
        attributes: ["name", "color", "is_default"],
        raw: true,
      });

      status_template.forEach((element) => {
        element.project_id = data.project_id;
      });

      await ProjectStatus.bulkCreate(status_template);

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

  async getProjectStats() {
    const data = [];

    function percentage(countThisWeek, countLastWeek) {
      const diff = countThisWeek - countLastWeek;
      return countLastWeek === 0 ? 100 : (diff / countLastWeek) * 100;
    }

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);

    const project_count = await Project.count();

    const total_projects = await percentage(
      project_count,
      await Project.count({
        where: {
          createdAt: {
            [Op.between]: [sevenDaysAgo, now],
          },
        },
      })
    );

    const projects_in_progress_count = await Project.count({
      where: {
        status: "ĐANG DIỄN RA",
      },
    });

    const projects_completed = await Project.count({
      where: {
        status: "HOÀN THÀNH",
      },
    });

    data.push(
      {
        key: "total_projects",
        label: "Số dự án",
        value: project_count,
        trend: `${total_projects > 0 ? "+" : "-"}${total_projects}%`,
        trendColor: `${total_projects > 0 ? "green" : "red"}`,
      },
      {
        key: "projects_in_progress",
        label: "Đang diễn ra",
        value: projects_in_progress_count,
      },
      {
        key: "projects_completed",
        label: "Hoàn thành",
        value: projects_completed,
      }
    );
    return data;
  }
}

module.exports = ProjectService;
