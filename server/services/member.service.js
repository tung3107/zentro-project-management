const { Op } = require("sequelize");
const { sequelize } = require("../config/database");
const Member = require("../models/Member");
const Project = require("../models/Project");
const Role = require("../models/Role");
const User = require("../models/User");
const ApiError = require("../utils/ApiError");

class MemberService {
  async getMembersByProject(project_id) {
    try {
      const data = await Member.findAll({
        where: {
          project_id: project_id,
          is_delete: 0,
          role_id: {
            [Op.ne]: null,
          },
        },
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["role_name", "role_id"],
          },
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              "email",
              "first_name",
              "last_name",
              "avatar",
            ],
          },
        ],
        attributes: [],
      });

      return data;
    } catch (error) {
      throw new ApiError(`Error: ${err.message}`, 400);
    }
  }

  async updateMemberByProject(project_id, members) {
    try {
      const isExisted = Project.findByPk(project_id);

      if (!isExisted) throw new ApiError("Không tìm thấy project", 400);
      return sequelize.transaction(async (t) => {
        // lấy old member
        const oldMembers = await Member.findAll({
          where: { project_id: project_id },
          transaction: t,
        });

        const oldMap = new Map(oldMembers.map((m) => [m.user_id, m]));
        const newMap = new Map(members.map((m) => [m.user.user_id, m]));

        for (const m of members) {
          const user_id = m.user.user_id;
          const role_id = m.role.role_id;

          if (!oldMap.has(user_id)) {
            await Member.create(
              {
                project_id: project_id,
                user_id: user_id,
                role_id: role_id,
              },
              { transaction: t }
            );
          } else {
            const oldRole = oldMap.get(user_id).role_id;
            if (oldRole !== role_id) {
              await Member.update(
                { role_id: role_id, is_delete: 0 },
                {
                  where: { project_id: project_id, user_id: user_id },
                  transaction: t,
                }
              );
            }
          }

          for (const old of oldMembers) {
            if (!newMap.has(old.user_id)) {
              await Member.update(
                { is_delete: 1, role_id: null },
                {
                  where: { project_id: project_id, user_id: old.user_id },
                  transaction: t,
                }
              );
            }
          }
        }
        return Member.findAll({
          where: { project_id: project_id },
          transaction: t,
        });
      });
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }
}

module.exports = MemberService;
