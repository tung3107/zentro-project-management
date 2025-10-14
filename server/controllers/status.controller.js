const ProjectStatusService = require("../services/status.service");
const { catchAsync } = require("../utils/catchAsync");

exports.getProjectStatus = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;

  const data = await new ProjectStatusService().getProjectStatus(project_id);

  res.status(200).json({
    status: "success",
    data,
  });
});
