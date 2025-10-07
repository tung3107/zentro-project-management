const { Op, where } = require("sequelize");
const { sequelize } = require("../config/database");
const Permission = require("../models/Permission");
const Role = require("../models/Role");
const RolePermission = require("../models/RolePermission");
const ApiError = require("../utils/ApiError");
const { getAllWithParams } = require("../utils/queryBuilder");
const Member = require("../models/Member");

class RoleService {
  async getRoleForSystem() {
    try {
      const data = await Role.findAll({
        where: { is_System: 1 },
        attributes: [
          ["role_id", "id"],
          ["role_name", "name"],
        ],
      });

      if (!data) throw new ApiError("Không tìm role", 400);
      return data;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async getRoleDropDownForProject() {
    try {
      const data = await Role.findAll({
        where: { is_System: 0 },
        attributes: ["role_id", "role_name"],
      });

      if (!data) throw new ApiError("Không tìm role", 400);
      return data;
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async getAllProjectRole(options = {}) {
    try {
      return await getAllWithParams(
        Role,
        { ...options, is_system: 0 },
        {
          defaultSortBy: "role_id",
          searchFields: ["role_id", "role_name", "description"],
          include: [
            {
              model: Permission,
              as: "permissions",
              attributes: ["description", "permission_name"],
            },
          ],
        }
      );
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async createProjectRole(body) {
    const transaction = await sequelize.transaction();
    try {
      const { role_name, description, permissions } = body;

      const exist = await Role.findOne({ where: { role_name } });
      if (exist) {
        throw new ApiError("Tên role đã được sử dụng, chọn tên khác!", 400);
      }

      const newRole = await Role.create(
        { role_name, description },
        { transaction }
      );

      if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        const rolePermissions = permissions.map((p) => ({
          role_id: newRole.role_id,
          permission_id: p.permission_id,
        }));

        await RolePermission.bulkCreate(rolePermissions, { transaction });
      }

      await transaction.commit();

      return "Tạo role thành công";
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async updateProjectRole(role_id, body) {
    const transaction = await sequelize.transaction();
    try {
      const { role_name, description, permissions } = body;

      const role = await Role.findByPk(role_id);
      if (!role) throw new ApiError("Role not found", 404);

      const exist = await Role.findOne({
        where: {
          role_name: body.role_name,
          role_id: { [Op.ne]: role_id },
        },
      });

      if (exist) {
        throw new ApiError("Tên role đã được sử dụng!", 400);
      }

      await role.update({ role_name, description }, { transaction });

      if (permissions && Array.isArray(permissions) && permissions.length > 0) {
        const rolePermissions = permissions.map((p) => ({
          role_id: role_id,
          permission_id: p.permission_id,
        }));

        return sequelize.transaction(async (t) => {
          // lấy old member
          const oldRoles = await RolePermission.findAll({
            where: { role_id: role_id },
            transaction: t,
          });

          const oldMap = new Map(oldRoles.map((m) => [m.permission_id, m]));
          const newMap = new Map(
            rolePermissions.map((m) => [m.permission_id, m])
          );

          for (const r of rolePermissions) {
            const role_id = r.role_id;
            const permission_id = r.permission_id;

            if (!oldMap.has(permission_id)) {
              await RolePermission.create(
                {
                  role_id: role_id,
                  permission_id: permission_id,
                },
                { transaction: t }
              );
            } else {
              console.log(oldMap);
              const oldPermission = oldMap.get(permission_id).permission_id;
              if (oldPermission !== permission_id) {
                await RolePermission.update(
                  { permission_id: permission_id },
                  {
                    where: { role_id: role_id, permission_id: permission_id },
                    transaction: t,
                  }
                );
              }
            }

            for (const old of oldRoles) {
              if (!newMap.has(old.permission_id)) {
                await RolePermission.destroy({
                  where: { role_id: role_id, permission_id: old.permission_id },
                  transaction: t,
                });
              }
            }
          }
          return RolePermission.findAll({
            where: { role_id: role_id },
            transaction: t,
          });
        });
      }
    } catch (err) {
      throw new ApiError(`Error: ${err.message}`, 400);
    }
  }

  async deleteProjectRole(role_id) {
    try {
      const exist = Role.findByPk(role_id);

      if (!exist) throw new ApiError("Role not found", 404);

      await sequelize.transaction(async (t) => {
        await Member.update(
          { role_id: null, is_delete: 1 },
          { where: { role_id }, transaction: t }
        );
        await Role.destroy({ where: { role_id: role_id } });

        await RolePermission.destroy({
          where: { role_id: role_id },
          transaction: t,
        });
      });
      return "Xóa thành công";
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }
}

module.exports = RoleService;
