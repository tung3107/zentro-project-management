const SprintService = require("../services/sprint.service");
const { catchAsync } = require("../utils/catchAsync");

exports.getCurrentSprintDetails = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;

  const data = await new SprintService().getCurrentSprintDetails(project_id);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getOneSprint = catchAsync(async (req, res, next) => {
  const { sprint_id } = req.params;

  const data = await new SprintService().getOneSprint(sprint_id);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getAllSprints = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;

  const data = await new SprintService().getAllSprints(project_id);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.createSprint_planned_status = catchAsync(async (req, res, next) => {
  const { project_id, name, goal, start_date, end_date } = req.body;

  const data = await new SprintService().createSprint_planned_status({
    project_id,
    name,
    goal,
    start_date,
    end_date,
  });

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.startSprint = catchAsync(async (req, res, next) => {
  const { sprint_id } = req.params;
  const { name, goal, start_date, end_date, project_id } = req.body;

  const data = await new SprintService().startSprint(sprint_id, {
    name,
    goal,
    start_date,
    end_date,
    project_id,
  });

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.updateSprint = catchAsync(async (req, res, next) => {
  const { sprint_id } = req.params;
  const { name, goal, start_date, end_date } = req.body;

  const data = await new SprintService().updateSprint(sprint_id, {
    name,
    goal,
    start_date,
    end_date,
  });

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.deleteSprint = catchAsync(async (req, res, next) => {
  const { sprint_id } = req.params;

  const data = await new SprintService().deleteSprint(sprint_id);

  res.status(200).json({
    status: "success",
    data,
  });
});
