const { catchAsync } = require("../utils/catchAsync");
const PermissionService = require("../services/permission.service");
const ApiError = require("../utils/ApiError");

exports.getOnePermission = catchAsync(async (req, res, next) => {
  const { id } = req.body;
  const data = await new PermissionService().getOnePermission(id);

  if (!data) {
    throw new ApiError("Permission id không tồn tại", 404);
  }

  res.status(200).json({
    status: "success",
    data: {
      data,
    },
  });
});
exports.getListOfPermissionByRole = catchAsync(async (req, res, next) => {
  const { role_id } = req.user;
  const data = await new PermissionService().getListOfPermissionByRole(role_id);
  if (!data) {
    throw new ApiError("Permission id không tồn tại", 404);
  }
  res.status(200).json({
    status: "success",
    data: {
      data,
    },
  });
});
