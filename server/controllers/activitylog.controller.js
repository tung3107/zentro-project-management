const { catchAsync } = require("../utils/catchAsync");
const ActivityLogService = require("../services/activitylog.service");

exports.getActivityLogsForProject = catchAsync(async (req, res, next) => {
  const { period, page, limit } = req.query;
  const data = await new ActivityLogService().getActivityLogForProject(
    req.params.project_id,
    period,
    page,
    limit
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getActivityLogForTask = catchAsync(async (req, res, next) => {
  const data = await new ActivityLogService().getActivityLogForTask(
    req.params.project_id,
    req.params.task_id
  );

  res.status(200).json({
    status: "success",
    data,
  });
});
