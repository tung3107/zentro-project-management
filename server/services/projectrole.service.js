const Member = require("../models/Member");
const Permission = require("../models/Permission");
const ProjectRolePermission = require("../models/ProjectRolePermission");
const Role = require("../models/Role");
const RolePermission = require("../models/RolePermission");
const Project = require("../models/Project");
const { sequelize } = require("../config/database");
const { Op } = require("sequelize");

class ProjectRoleController {
  async getProjectRole(user_id) {
    const members = await Member.findAll({
      where: { user_id },
      include: [{ model: Role, as: "role" }],
    });

    if (!members.length) return {};

    const result = {};

    for (const member of members) {
      const { project_id, role_id, role } = member;

      // FULL ACCESS
      if (role.role_name.includes("Trưởng nhóm")) {
        result[project_id] = { __full_access: true };
        continue;
      }

      // Lấy tất cả permission của project + role
      const prps = await ProjectRolePermission.findAll({
        where: { project_id, role_id },
        include: [{ model: Permission, as: "permission" }],
      });

      const formatted = {};

      for (const prp of prps) {
        const p = prp.permission;
        if (!p) continue; // alias mismatch

        if (!formatted[p.resource]) {
          formatted[p.resource] = {};
        }

        // forbidden: 0 = allow, 1 = deny
        formatted[p.resource][p.action] = !prp.forbidden;
      }

      result[project_id] = formatted;
    }

    return result;
  }

  async getAllProjectsWithRolePermissions() {
    // Get all projects
    const projects = await Project.findAll({
      attributes: ["project_id", "project_name"],
      order: [["project_name", "ASC"]],
    });

    const roles = await Role.findAll({
      where: {
        role_name: ["Trưởng nhóm", "Nhân viên", "Người xem"],
      },
      order: [
        [
          sequelize.literal(
            "FIELD(role_name, 'Trưởng nhóm', 'Nhân viên', 'Người xem')"
          ),
          "ASC",
        ],
      ],
    });

    // Get all permissions
    const resource = ["task", "sprint", "report", "comment"];
    const permissions = await Permission.findAll({
      where: { resource: { [Op.in]: resource } },
      order: [
        ["resource", "ASC"],
        ["action", "ASC"],
      ],
    });

    const result = [];

    for (const project of projects) {
      const projectData = {
        project_id: project.project_id,
        project_name: project.project_name,
        roles: [],
      };

      for (const role of roles) {
        const roleData = {
          role_id: role.role_id,
          role_name: role.role_name,
          permissions: [],
        };

        // Trưởng nhóm has full access
        if (role.role_name === "Trưởng nhóm") {
          roleData.full_access = true;
          roleData.permissions = permissions.map((p) => ({
            permission_id: p.permission_id,
            permission_name: p.permission_name,
            resource: p.resource,
            action: p.action,
            description: p.description,
            forbidden: false,
          }));
        } else {
          // Get project-specific role permissions
          const projectRolePermissions = await ProjectRolePermission.findAll({
            where: {
              project_id: project.project_id,
              role_id: role.role_id,
            },
            include: [{ model: Permission, as: "permission" }],
          });

          // Create a map of existing permissions
          const permMap = new Map(
            projectRolePermissions.map((prp) => [prp.permission_id, prp])
          );

          // Build permissions list
          for (const permission of permissions) {
            const existingPerm = permMap.get(permission.permission_id);
            roleData.permissions.push({
              permission_id: permission.permission_id,
              permission_name: permission.permission_name,
              resource: permission.resource,
              action: permission.action,
              description: permission.description,
              forbidden: existingPerm ? existingPerm.forbidden : true,
              prp_id: existingPerm ? existingPerm.id : null,
            });
          }
        }

        projectData.roles.push(roleData);
      }

      result.push(projectData);
    }

    return result;
  }

  async updateProjectRolePermissions(project_id, updates) {
    const transaction = await sequelize.transaction();
    try {
      // updates format: [{ role_id, permission_id, forbidden }]
      for (const update of updates) {
        const { role_id, permission_id, forbidden } = update;

        // Check if role is Trưởng nhóm
        const role = await Role.findByPk(role_id);
        if (role && role.role_name === "Trưởng nhóm") {
          // Skip updates for Trưởng nhóm (always full access)
          continue;
        }

        // Find or create project role permission
        const [prp, created] = await ProjectRolePermission.findOrCreate({
          where: {
            project_id,
            role_id,
            permission_id,
          },
          defaults: {
            forbidden: forbidden,
          },
          transaction,
        });

        if (!created) {
          // Update existing record
          await prp.update({ forbidden }, { transaction });
        }
      }

      await transaction.commit();
      return "Cập nhật quyền thành công";
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = new ProjectRoleController();
