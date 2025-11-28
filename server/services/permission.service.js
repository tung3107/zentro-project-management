const Member = require("../models/Member");
const Permission = require("../models/Permission");
const Role = require("../models/Role");

class PermissionService {
  async getAllPermissions() {
    const permission_list = await Permission.findAll();

    return {
      permission_list,
    };
  }
  async getOnePermission(id) {
    const permission = await Permission.findByPk(id);

    return {
      permission,
    };
  }

  async getListOfPermissionByRole(role_id, user_id) {
    // Get system role permissions
    let systemPermissions = await Permission.findAll({
      include: [
        {
          model: Role,
          as: "roles",
          attributes: [],
          through: { attributes: [] },
          where: { role_id },
        },
      ],
      raw: true,
      attributes: ["resource", "action"],
    });

    // Get all project roles for this user
    const memberRoles = await Member.findAll({
      where: { user_id, is_delete: 0 },
      include: [
        {
          model: Role,
          as: "role",
          attributes: ["role_id"],
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["resource", "action"],
              through: { attributes: [] },
            },
          ],
        },
      ],
    });

    const projectPermissions = [];
    memberRoles.forEach((member) => {
      if (member.role && member.role.permissions) {
        member.role.permissions.forEach((perm) => {
          projectPermissions.push({
            resource: perm.resource,
            action: perm.action,
          });
        });
      }
    });

    // Combine and deduplicate permissions
    const allPermissions = [...systemPermissions, ...projectPermissions];
    const uniquePermissions = Array.from(
      new Map(
        allPermissions.map((p) => [`${p.resource}-${p.action}`, p])
      ).values()
    );

    return uniquePermissions;
  }

  async getListOfPermissionByResource() {
    try {
      const data = await Permission.findAll({
        where: { is_system: 0 },
        raw: true, // để lấy plain object, không phải instance
      });

      const groupedPermissions = data.reduce((acc, perm) => {
        const {
          resource,
          action,
          permission_id,
          permission_name,
          description,
        } = perm;

        if (!acc[resource]) {
          acc[resource] = [];
        }

        acc[resource].push({
          permission_id,
          permission_name,
          description,
          action,
          resource,
        });

        return acc;
      }, {});

      // Sắp xếp action theo alphabet asc trong từng resource
      Object.keys(groupedPermissions).forEach((resource) => {
        groupedPermissions[resource].sort((a, b) =>
          a.action.localeCompare(b.action)
        );
      });

      return groupedPermissions;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }
}

module.exports = PermissionService;
