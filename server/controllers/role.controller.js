const RoleService = require("../services/role.service");
const { catchAsync } = require("../utils/catchAsync");

exports.getRoleForSystem = catchAsync(async (req, res, next) => {
  const data = await new RoleService().getRoleForSystem();

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getRoleDropDownForProject = catchAsync(async (req, res, next) => {
  const data = await new RoleService().getRoleDropDownForProject();

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getAllProjectRole = catchAsync(async (req, res, next) => {
  const { page, limit, sortBy, sortOrder, search } = req.query;

  const result = await new RoleService().getAllProjectRole({
    page: page,
    limit: limit,
    sortBy: sortBy,
    sortOrder: sortOrder,
    search: search,
  });

  res.status(200).json({
    status: "success",
    ...result,
  });
});

exports.createProjectRole = catchAsync(async (req, res, next) => {
  const { role_name, description, permissions } = req.body;

  const message = await new RoleService().createProjectRole({
    role_name,
    description,
    permissions,
  });

  res.status(201).json({
    message: message,
  });
});

exports.updateProjectRole = catchAsync(async (req, res, next) => {
  const { role_id, role_name, description, permissions } = req.body;

  const message = await new RoleService().updateProjectRole(role_id, {
    role_name,
    description,
    permissions,
  });

  res.status(201).json({
    message: message,
  });
});

exports.deleteProjectRole = catchAsync(async (req, res, next) => {
  const { role_id } = req.params;

  const message = await new RoleService().deleteProjectRole(role_id);

  res.status(201).json({
    message: message,
  });
});
