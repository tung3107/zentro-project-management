const { sequelize } = require("../config/database");
const Permission = require("./Permission");
const Role = require("./Role");
const RolePermission = require("./RolePermission");
const User = require("./User");

const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connect successfully");
  } catch (e) {
    console.error("❌ MySQL connection failed:", e);
  }
};

User.belongsTo(Role, { foreignKey: "role_id" });

Role.hasMany(User, { foreignKey: "role_id" });

Role.belongsToMany(Permission, {
  through: RolePermission,
  as: "permissions",
  foreignKey: "role_id",
  otherKey: "permission_id",
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  as: "roles",
  foreignKey: "permission_id",
  otherKey: "role_id",
});

// const hihi = async () => {
//   const email = "duongtung2106@gmail.com";
//   const user = await User.findOne({
//     where: { email },
//     include: {
//       model: Role,
//       include: {
//         model: Permission,
//         as: "permissions",
//         attributes: ["permission_name"],
//       },
//     },
//   });
//   console.log("Permissions:", JSON.stringify(user.Role.permissions, null, 2));
// };

module.exports = { sequelize, connectDB };
