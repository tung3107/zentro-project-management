const ProjectRolePermission = require("../models/ProjectRolePermission");
const projectroleService = require("../services/projectrole.service");
const { catchAsync } = require("../utils/catchAsync");

exports.getProjectRole = async (req, res, next) => {
  const user_id = req.user.user_id;

  const data = await projectroleService.getProjectRole(user_id);

  res.status(200).json({ data: data });
};

exports.getAllProjectsWithRolePermissions = catchAsync(
  async (req, res, next) => {
    const data = await projectroleService.getAllProjectsWithRolePermissions();

    res.status(200).json({
      status: "success",
      data,
    });
  }
);

exports.updateProjectRolePermissions = catchAsync(async (req, res, next) => {
  const { project_id, updates } = req.body;

  if (!project_id || !updates || !Array.isArray(updates)) {
    return res.status(400).json({
      status: "error",
      message: "project_id and updates array are required",
    });
  }

  const message = await projectroleService.updateProjectRolePermissions(
    project_id,
    updates
  );

  res.status(200).json({
    status: "success",
    message,
  });
});
