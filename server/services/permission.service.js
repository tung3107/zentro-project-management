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

  async getListOfPermissionByRole(role_id) {
    const role = await Permission.findAll({
      include: [
        {
          model: Role,
          as: "roles",
          attributes: [],
          through: { attributes: [] }, // ẩn cột ở bảng trung gian
          where: { role_id },
        },
      ],
      raw: true,
      attributes: ["resource", "action"],
    });

    return role;
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
