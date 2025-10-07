const { sequelize } = require("../config/database");
const Member = require("./Member");
const Permission = require("./Permission");
const Project = require("./Project");
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

//// QUAN HỆ CỦA ROLE VÀ USER

User.belongsTo(Role, { foreignKey: "role_id" });

Role.hasMany(User, { foreignKey: "role_id" });

//// QUAN HỆ NHIỀU NHIỀU CỦA ROLE VÀ PERMISSION
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

//// QUAN HỆ CỦA PROJECT VÀ USER => MEMBER
Member.belongsTo(Project, {
  foreignKey: "project_id",
  targetKey: "project_id",
  as: "project",
  onDelete: "CASCADE",
});

Member.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "user_id",
  as: "user",
  onDelete: "CASCADE",
});

Member.belongsTo(Role, {
  foreignKey: "role_id",
  targetKey: "role_id",
  as: "role",
  onDelete: "SET NULL", // nếu cần
});

Project.hasMany(Member, {
  foreignKey: "project_id",
  as: "members",
});

User.hasMany(Member, {
  foreignKey: "user_id",
  as: "memberships",
});

Role.hasMany(Member, {
  foreignKey: "role_id",
  as: "membersWithRole",
});

//// QUAN HỆ CỦA PROJECT VÀ USER => LEADER
// Project.belongsTo(User, {
//   foreignKey: "leader_id",
//   targetKey: "user_id",
//   as: "leader",
//   onDelete: "SET NULL",
// });

// User.hasMany(Project, {
//   foreignKey: "leader_id",
//   sourceKey: "user_id",
//   as: "ledProjects",
// });

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
