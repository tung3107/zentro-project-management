const { Op, where, literal, fn, col } = require("sequelize");
const ApiError = require("../utils/ApiError");
const User = require("../models/User");
const Member = require("../models/Member");

const crypto = require("crypto");
const emailService = require("./email.service");
const { getAllWithParams } = require("../utils/queryBuilder");
const Role = require("../models/Role");
const { default: axios } = require("axios");
const FormData = require("form-data");
const { uploadImg } = require("../utils/uploadImg");
const { sequelize } = require("../config/database");

class UserService {
  async getListOfUser() {
    try {
      const roleNames = ["Leader", "Project Manager"];

      const leaders = await Member.findAll({
        include: [
          {
            model: Role,
            as: "role",
            where: {
              role_name: { [Op.in]: roleNames },
            },
            attributes: [],
          },
          {
            model: User,
            as: "user",
            attributes: [
              "user_id",
              [
                fn(
                  "CONCAT",
                  col("user.first_name"),
                  " ",
                  col("user.last_name")
                ),
                "leader_name", // alias thành "name"
              ],
            ],
          },
        ],
        raw: true,
      });

      const result = leaders.map((l) => ({
        id: l["user.user_id"],
        name: l["user.leader_name"],
      }));

      return result;
    } catch (err) {
      throw new ApiError(`Error: ${err.message}`, 400);
    }
  }
  async getOneUser(user_id) {
    try {
      const data = await User.findOne({
        user_id: user_id,
      });
      return data;
    } catch (err) {
      throw new ApiError(`Error: ${err.message}`, 400);
    }
  }

  async deleteOneUser(user_id) {
    try {
      const member = await Member.findOne({ where: { user_id: user_id } });

      if (member.role_id === 7) {
        throw new ApiError(
          `User đang làm leader dự án, hãy gán role Leader cho người khác trước khi xóa`,
          400
        );
      }

      await sequelize.transaction(async (t) => {
        await User.update(
          { is_delete: 1, email: null },
          {
            where: { user_id: user_id },
            transaction: t,
          }
        );
        await Member.update(
          { is_delete: 1, role_id: null },
          { where: { user_id: user_id }, transaction: t }
        );
      });

      return "Xóa thành công";
    } catch (err) {
      throw new ApiError(`Error: ${err.message}`, 400);
    }
  }

  async getAllUser(options = {}) {
    return await getAllWithParams(
      User,
      { ...options, is_delete: 0 },
      {
        defaultSortBy: "user_id",
        searchFields: ["email", "first_name", "last_name", "user_id", "phone"],
        sortFields: ["user_id", "created_at"],
        include: [
          {
            model: Role,
            as: "Role",
            attribute: ["role_name"],
          },
        ],
      }
    );
  }

  async searchUserForProject(search, searchFields) {
    try {
      const whereConditions = {
        is_delete: 0, // ✅ chỉ lấy user chưa xóa
      };

      // 🔍 Search logic
      if (search && search.trim() && searchFields.length > 0) {
        const searchTokens = search.trim().split(/\s+/);

        const searchConditions = searchFields.map((field) => ({
          [Op.and]: searchTokens.map((token) => ({
            [field]: { [Op.like]: `%${token}%` },
          })),
        }));
        whereConditions[Op.or] = searchConditions;
      }

      const data = await User.findAll({
        where: whereConditions,
        include: [
          {
            model: Role,
            as: "Role",
            where: {
              role_name: { [Op.in]: ["Member"] },
            },
            attributes: ["role_name"],
          },
        ],
        raw: true,
      });

      if (!data) throw new ApiError(`Không tìm thấy người dùng`, 400);

      return data;
    } catch (error) {
      throw new ApiError(`Error: ${err.message}`, 400);
    }
  }

  async updateUser(user_id, body) {
    try {
      const user = await User.findByPk(user_id);
      if (!user) throw new ApiError("User not found", 404);

      // Chỉ tìm user khác (ngoài user hiện tại) có cùng số điện thoại
      const existPhone = await User.findOne({
        where: {
          phone: body.phone,
          user_id: { [Op.ne]: user_id }, // Sequelize.Op.ne
        },
      });

      if (existPhone) {
        throw new ApiError("Số điện thoại đã được sử dụng!", 400);
      }

      let avatar = null;

      if (body.file) {
        avatar = await uploadImg(body.file);
      }

      const userData = {
        ...body,
        avatar: avatar,
      };

      await user.update(userData);

      const data = await User.findByPk(user_id);

      return data;
    } catch (err) {
      throw new ApiError(`Error: ${err.message}`, 400);
    }
  }

  async createUser(body) {
    try {
      const exist = await User.findOne({ where: { email: body.email } });
      if (exist) {
        throw new ApiError("Email đã được sử dụng, chọn email khác!", 400);
      }
      const existPhone = await User.findOne({ where: { phone: body.phone } });

      if (existPhone) {
        throw new ApiError("Số điện thoại đã được sử dụng!", 400);
      }

      let avatar = null;

      if (body.file) {
        avatar = await uploadImg(body.file);
      }

      const newPassword = `${process.env.PASSWORD_PREFIX}@${crypto
        .randomBytes(5)
        .toString("hex")}`;

      const userData = {
        ...body,
        password: newPassword,
        avatar: avatar,
      };

      const use = User.create(userData);

      await emailService.sendUserInfor(body.email, newPassword);

      return "Tạo tài khoản thành công";
    } catch (error) {
      throw new ApiError(`Error: ${error.message}`, 400);
    }
  }

  async resetUserPassword(body) {
    try {
      const user = await User.findByPk(body.user_id);
      if (!user) throw new ApiError("Không tìm được user với user_id", 400);

      const newPassword = `${process.env.PASSWORD_PREFIX}@${crypto
        .randomBytes(5)
        .toString("hex")}`;

      user.password = newPassword;
      user.refreshToken = null;
      await user.save({ validate: false });

      await emailService.sendResetUserPassword(body.email, newPassword);

      return "Mật khẩu reset thành công";
    } catch (err) {
      throw new ApiError(`Error: ${err.message}`, 400);
    }
  }
}

module.exports = UserService;
