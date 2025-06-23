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
}

module.exports = PermissionService;
