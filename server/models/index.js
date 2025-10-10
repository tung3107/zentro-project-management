const { sequelize } = require("../config/database");
const ActivityLog = require("./ActivityLog");
const Attachment = require("./Attachment");
const Comment = require("./Comment");
const Label = require("./Label");
const Member = require("./Member");
const Permission = require("./Permission");
const Project = require("./Project");
const ProjectStatus = require("./ProjectStatus");
const Role = require("./Role");
const RolePermission = require("./RolePermission");
const Sprint = require("./Sprint");
const Task = require("./Task");
const TaskLabel = require("./TaskLabel");
const User = require("./User");
const WorkFlow = require("./WorkFlow");

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

/// STATUS
ProjectStatus.belongsTo(Project, {
  foreignKey: "project_id",
  targetKey: "project_id",
  as: "project",
  onDelete: "CASCADE",
});
Project.hasMany(ProjectStatus, {
  foreignKey: "project_id",
  as: "projectstatus",
});

//Workflow

WorkFlow.belongsTo(Project, {
  foreignKey: "project_id",
  targetKey: "project_id",
  as: "project",
});

WorkFlow.belongsTo(ProjectStatus, {
  foreignKey: "from_status_id",
  targetKey: "status_id",
  as: "fromStatus",
});

WorkFlow.belongsTo(ProjectStatus, {
  foreignKey: "to_status_id",
  targetKey: "status_id",
  as: "toStatus",
});

WorkFlow.belongsTo(Role, {
  foreignKey: "allowed_role_id",
  targetKey: "role_id",
  as: "allowedRole",
});

Project.hasMany(WorkFlow, { foreignKey: "project_id", as: "workflows" });

ProjectStatus.hasMany(WorkFlow, {
  foreignKey: "from_status_id",
  as: "outgoingWorkflows",
});

ProjectStatus.hasMany(WorkFlow, {
  foreignKey: "to_status_id",
  as: "incomingWorkflows",
});

Role.hasMany(WorkFlow, {
  foreignKey: "allowed_role_id",
  as: "allowedWorkflows",
});

/// Sprint

Sprint.belongsTo(Project, {
  foreignKey: "project_id",
  targetKey: "project_id",
  as: "project",
  onDelete: "CASCADE",
});
Project.hasMany(Sprint, { foreignKey: "project_id", as: "sprints" });

/// Task

Task.belongsTo(Project, {
  foreignKey: "project_id",
  targetKey: "project_id",
  as: "project",
});
Project.hasMany(Task, { foreignKey: "project_id", as: "tasks" });

Task.belongsTo(Sprint, {
  foreignKey: "sprint_id",
  targetKey: "sprint_id",
  as: "sprint",
});
Sprint.hasMany(Task, { foreignKey: "sprint_id", as: "tasks" });

Task.belongsTo(ProjectStatus, {
  foreignKey: "status_id",
  targetKey: "status_id",
  as: "status",
});
ProjectStatus.hasMany(Task, { foreignKey: "status_id", as: "tasks" });

Task.belongsTo(User, {
  foreignKey: "assignee_id",
  targetKey: "user_id",
  as: "assignee",
});
Task.belongsTo(User, {
  foreignKey: "reporter_id",
  targetKey: "user_id",
  as: "reporter",
});

User.hasMany(Task, { foreignKey: "assignee_id", as: "assignedTasks" });
User.hasMany(Task, { foreignKey: "reporter_id", as: "reportedTasks" });

/// COmment
Comment.belongsTo(Task, { foreignKey: "task_id", as: "task" });
Comment.belongsTo(User, { foreignKey: "user_id", as: "user" });
Task.hasMany(Comment, { foreignKey: "task_id", as: "comments" });

///Attachment
Attachment.belongsTo(Task, { foreignKey: "task_id", as: "task" });
Task.hasMany(Attachment, { foreignKey: "task_id", as: "attachments" });

Attachment.belongsTo(User, {
  foreignKey: "uploaded_by",
  targetKey: "user_id",
  as: "user",
});

/// Label
Label.belongsTo(Project, {
  foreignKey: "project_id",
  targetKey: "project_id",
  as: "project",
});
Project.hasMany(Label, {
  foreignKey: "project_id",
  as: "labels",
});

Task.belongsToMany(Label, {
  through: TaskLabel,
  as: "labels",
  foreignKey: "task_id",
  otherKey: "label_id",
  onDelete: "CASCADE",
});

Label.belongsToMany(Task, {
  through: TaskLabel,
  as: "tasks",
  foreignKey: "label_id",
  otherKey: "task_id",
  onDelete: "CASCADE",
});

/// Activity Log
ActivityLog.belongsTo(Project, {
  foreignKey: "project_id",
  targetKey: "project_id",
  as: "project",
  onDelete: "SET NULL",
});

// Quan hệ với User
ActivityLog.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "user_id",
  as: "user",
  onDelete: "SET NULL",
});

// Một project có thể có nhiều log
Project.hasMany(ActivityLog, {
  foreignKey: "project_id",
  as: "activityLogs",
});

// Một user có thể có nhiều log
User.hasMany(ActivityLog, {
  foreignKey: "user_id",
  as: "activityLogs",
});

module.exports = { sequelize, connectDB };
