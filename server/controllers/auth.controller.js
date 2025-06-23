const { catchAsync } = require("../utils/catchAsync");
const AuthService = require("../services/auth.service");
const ApiError = require("../utils/ApiError");
const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const User = require("../models/User");
const RolePermission = require("../models/RolePermission");
const Permission = require("../models/Permission");
const { where } = require("sequelize");
const Role = require("../models/Role");

exports.protectRoute = catchAsync(async (req, res, next) => {
  // 1. Check the Bearer auth
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    throw new ApiError("Unauthorized! Please login and try again", 400);
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  if (!decoded) {
    throw new ApiError("Token hết hạn nha!", 401);
  }

  const freshUser = await User.findByPk(decoded.id);

  if (!freshUser) {
    throw new ApiError("Token no longer belongs to user! Login again", 401);
  }

  req.user = freshUser;

  next();
});

exports.authorize = (resource, action) => {
  return async (req, res, next) => {
    const roleId = req.user.role_id;

    const allowed = await Role.findOne({
      where: { role_id: roleId },
      include: [
        {
          model: Permission,
          as: "permissions", // đúng alias
          through: { attributes: [] }, // ẩn RolePermission
          required: true,
          attributes: [],
          where: { resource, action },
        },
      ],
      attributes: ["role_id"],
      raw: true,
    });
    if (!allowed) throw new ApiError("Forbidden", 403);
    next();
  };
};

exports.login = catchAsync(async (req, res, next) => {
  let { email, password, isRemember } = req.body;
  const user = await new AuthService().login(email, password, isRemember);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});

exports.refreshToken = catchAsync(async (req, res, next) => {
  let { refreshToken } = req.body;
  const user = await new AuthService().refreshToken(refreshToken);

  res.status(200).json({
    status: "success",
    data: {
      user,
    },
  });
});
exports.forgotPassword = catchAsync(async (req, res, next) => {
  let { email } = req.body;
  const message = await new AuthService().forgotPassword(email);

  res.status(200).json({
    status: "success",
    data: {
      message,
    },
  });
});

exports.verifyOtp = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;
  const response = await new AuthService().verifyOtp(email, otp);

  res.status(200).json({
    status: "success",
    data: {
      response,
    },
  });
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const { tempResetToken, newPassword, email } = req.body;
  const message = await new AuthService().resetPassword(
    tempResetToken,
    newPassword,
    email
  );

  res.status(200).json({
    status: "success",
    data: {
      message,
    },
  });
});
