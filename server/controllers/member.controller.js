const { catchAsync } = require("../utils/catchAsync");
const MemberService = require("../services/member.service");

exports.getMembersByProject = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;

  const data = await new MemberService().getMembersByProject(project_id);

  if (!data) {
    res.status(400).json({
      status: "failed",
      data: [],
    });
  }

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getMembersByProject_fordropdown = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;
  const data = await new MemberService().getMembersByProject_fordropdown(
    project_id
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.updateMemberOfProject = catchAsync(async (req, res, next) => {
  const { project_id, members } = req.body;

  const data = await new MemberService().updateMemberByProject(
    project_id,
    members
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.createMemberByProject = catchAsync(async (req, res, next) => {
  const { project_id, members } = req.body;

  const data = await new MemberService().createMemberByProject(
    project_id,
    members
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.searchMembersByProject = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;
  const { q } = req.query;

  const data = await new MemberService().searchMembersByProject(project_id, q);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getAvailableUsers = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;
  const { search } = req.query;

  const data = await new MemberService().getAvailableUsers(project_id, search);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.checkMemberPermission = catchAsync(async (req, res, next) => {
  const userId = req.user.user_id;
  const roleId = req.user.role_id;
  const { project_id } = req.params;

  const canManage = await new MemberService().checkMemberPermission(
    userId,
    roleId,
    project_id
  );

  res.status(200).json({
    status: "success",
    data: {
      canManage,
    },
  });
});
