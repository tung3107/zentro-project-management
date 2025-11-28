const { Op, fn, col } = require("sequelize");
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
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async getMembersByProject_fordropdown(project_id) {
    try {
      const data = await User.findAll({
        include: [
          {
            model: Member,
            as: "memberships",
            where: { project_id: project_id },
          },
        ],
        attributes: [
          ["user_id", "id"],
          [
            fn("CONCAT", col("user.first_name"), " ", col("user.last_name")),
            "name",
          ],
          "avatar",
          "email",
        ],
      });

      return data;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
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

  async createMemberByProject(project_id, members) {
    try {
      const isExisted = await Project.findByPk(project_id);

      if (!isExisted) throw new ApiError("Không tìm thấy project", 400);

      return sequelize.transaction(async (t) => {
        for (const m of members) {
          const user_id = m.user.user_id;
          const role_id = m.role.role_id;

          // Check if member already exists
          const existingMember = await Member.findOne({
            where: {
              project_id: project_id,
              user_id: user_id,
            },
            transaction: t,
          });

          if (existingMember) {
            // If member exists but was deleted, restore them
            if (existingMember.is_delete) {
              await existingMember.update(
                {
                  is_delete: false,
                  role_id: role_id,
                },
                { transaction: t }
              );
            } else {
              throw new ApiError(
                `User ${user_id} is already a member of this project`,
                400
              );
            }
          } else {
            // Create new member
            await Member.create(
              {
                project_id: project_id,
                user_id: user_id,
                role_id: role_id,
              },
              { transaction: t }
            );
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

  async searchMembersByProject(project_id, query) {
    try {
      const whereCondition = {
        project_id: project_id,
        is_delete: 0,
        role_id: {
          [Op.ne]: null,
        },
      };

      const data = await Member.findAll({
        where: whereCondition,
        include: [
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
            where: query
              ? {
                  [Op.or]: [
                    {
                      first_name: { [Op.like]: `%${query}%` },
                    },
                    {
                      last_name: { [Op.like]: `%${query}%` },
                    },
                    {
                      email: { [Op.like]: `%${query}%` },
                    },
                    {
                      user_id: { [Op.like]: `%${query}%` },
                    },
                  ],
                }
              : undefined,
          },
        ],
        attributes: [],
        limit: 10,
      });

      return data;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async getAvailableUsers(project_id, search) {
    try {
      // Get all users who are NOT in this project or are deleted from it
      const whereCondition = {
        is_delete: 0,
      };

      // Add search conditions if query provided
      if (search && search.trim()) {
        whereCondition[Op.or] = [
          { first_name: { [Op.like]: `%${search}%` } },
          { last_name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { user_id: { [Op.like]: `%${search}%` } },
        ];
      }

      const data = await User.findAll({
        where: whereCondition,
        include: [
          {
            model: Role,
            as: "Role",
            attributes: ["role_name", "role_id"],
          },
          {
            model: Member,
            as: "memberships",
            where: {
              project_id: project_id,
              is_delete: 0,
            },
            required: false, // LEFT JOIN to get users NOT in project
          },
        ],
        attributes: ["user_id", "email", "first_name", "last_name", "avatar"],
        limit: 20,
      });

      // Filter out users who are already members
      const availableUsers = data.filter(
        (user) => !user.memberships || user.memberships.length === 0
      );

      return availableUsers;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async checkMemberPermission(userId, roleId, projectId) {
    try {
      const Permission = require("../models/Permission");
      const RolePermission = require("../models/RolePermission");

      // First check system role permission (for admins)
      const hasSystemPermission = await Role.findOne({
        where: { role_id: roleId },
        include: [
          {
            model: Permission,
            as: "permissions",
            through: { attributes: [] },
            required: true,
            attributes: [],
            where: { resource: "member", action: "manage_members" },
          },
        ],
        attributes: ["role_id"],
        raw: true,
      });

      if (hasSystemPermission) return true;

      // Check project-specific role permission
      const memberData = await Member.findOne({
        where: {
          user_id: userId,
          project_id: projectId,
          is_delete: 0,
        },
        include: [
          {
            model: Role,
            as: "role",
            attributes: ["role_id"],
            include: [
              {
                model: Permission,
                as: "permissions",
                through: { attributes: [] },
                required: true,
                attributes: [],
                where: { resource: "member", action: "manage_members" },
              },
            ],
          },
        ],
      });

      return !!memberData;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }
}
module.exports = MemberService;
