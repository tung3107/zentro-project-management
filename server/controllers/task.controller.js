const TaskService = require("../services/task.service");
const { catchAsync } = require("../utils/catchAsync");

exports.getOneTask = catchAsync(async (req, res, next) => {
  const { task_id } = req.params;
  const user_id = req.user.user_id;

  const data = await new TaskService().getOneTask(task_id, user_id);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.updateOneTask = catchAsync(async (req, res, next) => {
  const { task_id } = req.params;
  const user_id = req.user.user_id;

  const {
    project_id,
    sprint_id,
    title,
    description,
    type,
    priority,
    status_id,
    assignee_id,
    parent_id,
    estimate,
    spent_time,
    start_date,
    due_date,
    reporter_id,
  } = req.body;

  const data = await new TaskService().updateOneTask(task_id, user_id, {
    project_id,
    sprint_id,
    title,
    description,
    type,
    priority,
    status_id,
    assignee_id,
    parent_id,
    estimate,
    spent_time,
    start_date,
    due_date,
    reporter_id,
  });

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getBackLog_TaskBySprint = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;
  const user_id = req.user.user_id;

  const data = await new TaskService().getBackLog_TaskBySprint(
    user_id,
    project_id
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.searchTaskBackLog = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;
  const user_id = req.user.user_id;

  const { search } = req.query;

  const data = await new TaskService().searchTaskBackLog(
    user_id,
    project_id,
    search
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.createTask = catchAsync(async (req, res, next) => {
  const user_id = req.user.user_id;
  const {
    project_id,
    sprint_id,
    title,
    description,
    type,
    priority,
    status_id,
    assignee_id,
    parent_id,
    estimate,
    spent_time,
    start_date,
    due_date,
    reporter_id,
  } = req.body;

  const data = await new TaskService().createTask(user_id, {
    project_id,
    sprint_id,
    title,
    description,
    type,
    status_id,
    assignee_id,
    priority,
    parent_id,
    estimate,
    spent_time,
    start_date,
    due_date,
    reporter_id,
  });

  res.status(201).json({
    status: "success",
    data,
  });
});
