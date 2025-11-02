const TaskService = require("../services/task.service");
const { getIO } = require("../socket");
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

exports.deleteOneTask = catchAsync(async (req, res, next) => {
  const { task_id } = req.params;
  const user_id = req.user.user_id;

  const data = await new TaskService().deleteOneTask(task_id, user_id);

  const io = getIO();
  io.emit("task:deleted", { task_id });

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

  const io = getIO();
  io.emit("task:updated", { task_id, ...req.body });

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

exports.getTaskForBoard = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;

  const user_id = req.user.user_id;

  const data = await new TaskService().getTaskForBoard(user_id, project_id);

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

  const io = getIO();
  io.emit("task:created", data);

  res.status(201).json({
    status: "success",
    data,
  });
});

exports.searchTaskForBoard = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;
  const user_id = req.user.user_id;
  const { search, assignee_id, priority, type } = req.query;

  const filters = {};
  if (assignee_id) filters.assignee_id = assignee_id;
  if (priority !== undefined) filters.priority = parseInt(priority);
  if (type) filters.type = type;

  const data = await new TaskService().searchTaskForBoard(
    user_id,
    project_id,
    search,
    filters
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getBurndownChart = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;

  const data = await new TaskService().getBurndownChart(project_id);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getTasksByMonth = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;
  const { year, month, assignee_id } = req.query;

  const data = await new TaskService().getTasksByMonth(
    project_id,
    parseInt(year),
    parseInt(month),
    assignee_id
  );

  res.status(200).json({
    status: "success",
    data,
  });
});
