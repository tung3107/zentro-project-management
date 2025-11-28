const UserService = require("../services/user.service");
const { catchAsync } = require("../utils/catchAsync");
const axios = require("axios");
const FormData = require("form-data");

exports.getAllUser = catchAsync(async (req, res, next) => {
  const data = await new UserService().getListOfUser();

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.searchUserForProject = catchAsync(async (req, res, next) => {
  const { search } = req.query;
  const searchFields = ["user_id", "first_name", "last_name", "email", "phone"];

  const data = await new UserService().searchUserForProject(
    search,
    searchFields
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.resetUserPassword = catchAsync(async (req, res, next) => {
  const message = await new UserService().resetUserPassword(req.body);

  res.status(200).json({
    status: "success",
    message,
  });
});

exports.updateUserAdmin = catchAsync(async (req, res, next) => {
  const { email, phone, first_name, last_name, role_id } = req.body;
  const { user_id } = req.params;

  let file = req.file;

  const data = await new UserService().updateUser(user_id, {
    email,
    phone,
    first_name,
    last_name,
    role_id,
    file,
  });

  res.status(201).json({
    status: "success",
    message: "Sửa thông tin người dùng thành công",
    ...data,
  });
});

exports.updateUserProfile = catchAsync(async (req, res, next) => {
  const { phone, first_name, last_name, avatar } = req.body;
  const { user_id } = req.user;

  const data = await new UserService().updateUser(user_id, {
    phone,
    first_name,
    last_name,
    avatar,
  });

  res.status(201).json({
    status: "success",
    message: "Sửa thông tin thành công",
    ...data,
  });
});

exports.createUser = catchAsync(async (req, res, next) => {
  const { email, phone, first_name, last_name, role_id } = req.body;

  let file = req.file;

  const createdAt = Date.now();

  const message = await new UserService().createUser({
    email,
    phone,
    first_name,
    last_name,
    role_id,
    file,
    createdAt,
  });

  res.status(201).json({
    message: message,
  });
});

exports.deleteOneUser = catchAsync(async (req, res, next) => {
  const { user_id } = req.params;

  const message = await new UserService().deleteOneUser(user_id);

  res.status(200).json({
    status: "success",
    message,
  });
});

exports.getAllUserWithParam = catchAsync(async (req, res, next) => {
  const { page, limit, sortBy, sortOrder, search, role_id } = req.query;

  const result = await new UserService().getAllUser({
    page: page,
    limit: limit,
    sortBy: sortBy,
    sortOrder: sortOrder,
    search: search,
    role_id: role_id,
  });

  res.status(200).json({
    status: "success",
    ...result,
  });
});

exports.getOneUser = catchAsync(async (req, res, next) => {
  const { user_id } = req.params;
  const data = await new UserService().getOneUser(user_id);

  res.status(200).json({
    status: "success",
    data,
  });
});
