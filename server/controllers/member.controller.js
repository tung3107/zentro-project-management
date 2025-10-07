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
