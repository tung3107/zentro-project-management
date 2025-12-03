const { sequelize } = require("../config/database");
const ActivityLog = require("./ActivityLog");
const Attachment = require("./Attachment");
const Chat = require("./Chat");
const ChatMember = require("./ChatMember");
const Comment = require("./Comment");
const CommentMention = require("./CommentMention");
const CommentTaskMention = require("./CommentTaskMention");
const Label = require("./Label");
const MediaFile = require("./MediaFile");
const Member = require("./Member");
const Message = require("./Message");
const Notification = require("./Notification");
const Permission = require("./Permission");
const Project = require("./Project");
const ProjectStatus = require("./ProjectStatus");
const Role = require("./Role");
const RolePermission = require("./RolePermission");
const RoleTemplate = require("./RoleTemplate");
const Sprint = require("./Sprint");
const Task = require("./Task");
const TaskLabel = require("./TaskLabel");
const TaskLink = require("./TaskLink");
const User = require("./User");
const WorkFlow = require("./WorkFlow");
const TestSuite = require("./TestSuite");
const TestCase = require("./TestCase");
const TestCaseVersion = require("./TestCaseVersion");
const TestCaseAttachment = require("./TestCaseAttachment");
const TestCaseTaskRelation = require("./TestCaseTaskRelation");
const Report = require("./Report");
const UserDevice = require("./UserDevice");

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

//// QUAN HỆ CỦA USER VÀ USER DEVICE
User.hasMany(UserDevice, { foreignKey: "user_id", as: "devices" });
UserDevice.belongsTo(User, { foreignKey: "user_id", as: "user" });

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

RolePermission.belongsTo(Permission, { foreignKey: "permission_id" });
Permission.hasMany(RolePermission, { foreignKey: "permission_id" });

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

Task.hasMany(TaskLink, { foreignKey: "task_id", as: "links" });
TaskLink.belongsTo(Task, { foreignKey: "linked_task_id", as: "linkedTask" });

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

//// TASK - TASK
// Tự liên kết
Task.belongsTo(Task, { as: "parent", foreignKey: "parent_id" });
Task.hasMany(Task, { as: "subtasks", foreignKey: "parent_id" });

// Chat

Chat.belongsToMany(User, {
  through: ChatMember,
  foreignKey: "chat_id",
  otherKey: "user_id",
  as: "members",
});

User.belongsToMany(Chat, {
  through: ChatMember,
  foreignKey: "user_id",
  otherKey: "chat_id",
  as: "chats",
});

// Direct relationships with ChatMember
Chat.hasMany(ChatMember, { foreignKey: "chat_id", as: "chatMembers" });
ChatMember.belongsTo(Chat, { foreignKey: "chat_id" });

User.hasMany(ChatMember, { foreignKey: "user_id", as: "chatMemberships" });
ChatMember.belongsTo(User, { foreignKey: "user_id" });

Chat.hasMany(Message, { foreignKey: "chat_id", as: "messages" });
Message.belongsTo(Chat, { foreignKey: "chat_id" });

User.hasMany(Message, { foreignKey: "sender_id", as: "sentMessages" });
Message.belongsTo(User, { foreignKey: "sender_id", as: "sender" });

Chat.hasMany(MediaFile, { foreignKey: "chat_id", as: "mediaFiles" });
MediaFile.belongsTo(Chat, { foreignKey: "chat_id" });

// ======= Associations =======

// Comment <-> Task (mentioned tasks)
Comment.belongsToMany(Task, {
  through: CommentTaskMention,
  as: "mentionedTasks",
  foreignKey: "comment_id",
  otherKey: "mentioned_task_id",
});
Task.belongsToMany(Comment, {
  through: CommentTaskMention,
  as: "mentionedInComments",
  foreignKey: "mentioned_task_id",
  otherKey: "comment_id",
});

// Comment <-> User (mentioned users)
Comment.belongsToMany(User, {
  through: CommentMention,
  as: "mentionedUsers",
  foreignKey: "comment_id",
  otherKey: "mentioned_user_id",
});
User.belongsToMany(Comment, {
  through: CommentMention,
  as: "mentionedInComments",
  foreignKey: "mentioned_user_id",
  otherKey: "comment_id",
});

// Notification relationships
Notification.belongsTo(User, {
  foreignKey: "user_id",
  targetKey: "user_id",
  as: "recipient",
});

Notification.belongsTo(User, {
  foreignKey: "actor_id",
  targetKey: "user_id",
  as: "actor",
});

Notification.belongsTo(Task, {
  foreignKey: "task_id",
  targetKey: "task_id",
  as: "task",
});

Notification.belongsTo(Sprint, {
  foreignKey: "sprint_id",
  targetKey: "sprint_id",
  as: "sprint",
});

Notification.belongsTo(Comment, {
  foreignKey: "comment_id",
  targetKey: "comment_id",
  as: "comment",
});

Notification.belongsTo(Project, {
  foreignKey: "project_id",
  targetKey: "project_id",
  as: "project",
});

User.hasMany(Notification, {
  foreignKey: "user_id",
  as: "notifications",
});

User.hasMany(Notification, {
  foreignKey: "actor_id",
  as: "triggeredNotifications",
});

/// TestCase and TestSuite
TestSuite.belongsTo(Project, {
  foreignKey: "project_id",
  targetKey: "project_id",
  as: "project",
  onDelete: "CASCADE",
});

TestSuite.belongsTo(User, {
  foreignKey: "created_by",
  targetKey: "user_id",
  as: "creator",
});

Project.hasMany(TestSuite, {
  foreignKey: "project_id",
  as: "testSuites",
});

TestCase.belongsTo(Project, {
  foreignKey: "project_id",
  targetKey: "project_id",
  as: "project",
  onDelete: "CASCADE",
});

TestCase.belongsTo(TestSuite, {
  foreignKey: "suite_id",
  targetKey: "suite_id",
  as: "suite",
});

TestCase.belongsTo(User, {
  foreignKey: "created_by",
  targetKey: "user_id",
  as: "creator",
});

TestCase.belongsTo(User, {
  foreignKey: "updated_by",
  targetKey: "user_id",
  as: "updater",
});

Project.hasMany(TestCase, {
  foreignKey: "project_id",
  as: "testCases",
});

TestSuite.hasMany(TestCase, {
  foreignKey: "suite_id",
  as: "testCases",
});

TestCaseVersion.belongsTo(TestCase, {
  foreignKey: "testcase_id",
  targetKey: "testcase_id",
  as: "testcase",
  onDelete: "CASCADE",
});

TestCaseVersion.belongsTo(User, {
  foreignKey: "updated_by",
  targetKey: "user_id",
  as: "updater",
});

TestCase.hasMany(TestCaseVersion, {
  foreignKey: "testcase_id",
  as: "versions",
});

TestCaseAttachment.belongsTo(TestCase, {
  foreignKey: "testcase_id",
  targetKey: "testcase_id",
  as: "testcase",
  onDelete: "CASCADE",
});

TestCaseAttachment.belongsTo(User, {
  foreignKey: "uploaded_by",
  targetKey: "user_id",
  as: "uploader",
});

TestCase.hasMany(TestCaseAttachment, {
  foreignKey: "testcase_id",
  as: "attachments",
});

TestCaseTaskRelation.belongsTo(TestCase, {
  foreignKey: "testcase_id",
  targetKey: "testcase_id",
  as: "testcase",
});

TestCaseTaskRelation.belongsTo(Task, {
  foreignKey: "task_id",
  targetKey: "task_id",
  as: "task",
});

TestCaseTaskRelation.belongsTo(TestSuite, {
  foreignKey: "suite_id",
  targetKey: "suite_id",
  as: "suite",
});

TestCase.hasMany(TestCaseTaskRelation, {
  foreignKey: "testcase_id",
  as: "taskRelations",
});

Task.hasMany(TestCaseTaskRelation, {
  foreignKey: "task_id",
  as: "testcaseRelations",
});

TestSuite.hasMany(TestCaseTaskRelation, {
  foreignKey: "suite_id",
  as: "taskRelations",
});

// Test Run Associations
const TestRun = require("./TestRun");
const TestRunTestCase = require("./TestRunTestCase");
const TestRunStep = require("./TestRunStep");
const TestRunHistory = require("./TestRunHistory");
const ProjectRolePermission = require("./ProjectRolePermission");

TestRun.belongsTo(Project, { foreignKey: "project_id", as: "project" });
TestRun.belongsTo(User, { foreignKey: "created_by", as: "creator" });
Project.hasMany(TestRun, { foreignKey: "project_id", as: "testRuns" });

TestRun.hasMany(TestRunTestCase, {
  foreignKey: "test_run_id",
  as: "testRunTestCases",
});
TestRunTestCase.belongsTo(TestRun, { foreignKey: "test_run_id" });

TestRunTestCase.belongsTo(TestCase, {
  foreignKey: "testcase_id",
  as: "testcase",
});
TestRunTestCase.belongsTo(User, { foreignKey: "assigned_to", as: "assignee" });
TestRunTestCase.belongsTo(User, { foreignKey: "executed_by", as: "executor" });

TestRunTestCase.hasMany(TestRunStep, {
  foreignKey: "test_run_testcase_id",
  as: "steps",
});
TestRunStep.belongsTo(TestRunTestCase, { foreignKey: "test_run_testcase_id" });

TestRunTestCase.hasMany(TestRunHistory, {
  foreignKey: "test_run_testcase_id",
  as: "history",
});
TestRunHistory.belongsTo(TestRunTestCase, {
  foreignKey: "test_run_testcase_id",
});
TestRunHistory.belongsTo(User, { foreignKey: "executed_by", as: "executor" });

/// Report
Report.belongsTo(Project, {
  foreignKey: "project_id",
  targetKey: "project_id",
  as: "project",
  onDelete: "CASCADE",
});
Project.hasMany(Report, { foreignKey: "project_id", as: "reports" });

Report.belongsTo(User, {
  foreignKey: "generated_by",
  targetKey: "user_id",
  as: "generator",
  onDelete: "SET NULL",
});
User.hasMany(Report, { foreignKey: "generated_by", as: "generated_reports" });

Project.belongsToMany(Role, {
  through: ProjectRolePermission,
  foreignKey: "project_id",
  otherKey: "role_id",
});
Role.belongsToMany(Project, {
  through: ProjectRolePermission,
  foreignKey: "role_id",
  otherKey: "project_id",
});

// Permission -> project role override
Permission.belongsToMany(Project, {
  through: ProjectRolePermission,
  foreignKey: "permission_id",
  otherKey: "project_id",
});
Project.belongsToMany(Permission, {
  through: ProjectRolePermission,
  foreignKey: "project_id",
  otherKey: "permission_id",
});

ProjectRolePermission.belongsTo(Permission, {
  foreignKey: "permission_id",
  as: "permission", // alias nên include phải trùng
});
Permission.hasMany(ProjectRolePermission, { foreignKey: "permission_id" });

// Cũng liên kết role để reference nếu cần
ProjectRolePermission.belongsTo(Role, { foreignKey: "role_id", as: "role" });
Role.hasMany(ProjectRolePermission, { foreignKey: "role_id" });

// RoleTemplate associations
RoleTemplate.belongsTo(Role, {
  foreignKey: "role_id",
  targetKey: "role_id",
  as: "role",
});
Role.hasMany(RoleTemplate, { foreignKey: "role_id", as: "roleTemplates" });

RoleTemplate.belongsTo(Permission, {
  foreignKey: "permission_id",
  targetKey: "permission_id",
  as: "permission",
});
Permission.hasMany(RoleTemplate, {
  foreignKey: "permission_id",
  as: "roleTemplates",
});

module.exports = { sequelize, connectDB };
