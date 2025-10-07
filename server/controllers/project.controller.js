const { catchAsync } = require("../utils/catchAsync");
const ProjectService = require("../services/project.service");

exports.getOneProject = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;
  const data = await new ProjectService().getOneProject(project_id);

  res.status(200).json({
    status: "success",
    ...data,
  });
});

exports.deleteOneProject = catchAsync(async (req, res, next) => {
  const { project_id } = req.params;
  const message = await new ProjectService().deleteOneProject(project_id);

  res.status(200).json({
    status: "success",
    message,
  });
});

exports.updateOneProject = catchAsync(async (req, res, next) => {
  const project_id = req.params.project_id;
  const { project_name, description, leader_id, status, start_date, end_date } =
    req.body;

  let file = req.file;

  const data = await new ProjectService().updateOneProject(project_id, {
    project_name,
    description,
    leader_id,
    status,
    start_date,
    end_date,
    file,
  });

  res.status(200).json({
    status: "success",
    ...data,
  });
});

exports.getProjectListByUser = catchAsync(async (req, res, next) => {
  const { user_id } = req.params;

  const data = await new ProjectService().getProjectListByUser(user_id);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.getAllProjectsWithParam = catchAsync(async (req, res, next) => {
  const {
    page,
    limit,
    sortBy,
    sortOrder,
    search,
    status,
    leader_id,
    start_dateFrom,
    end_dateTo,
  } = req.query;

  const result = await new ProjectService().getAllProjectsWithParam({
    page: page,
    limit: limit,
    sortBy: sortBy,
    sortOrder: sortOrder,
    search: search,
    status: status ? status.split(",") : undefined,
    leader_id: leader_id,
    start_dateFrom: start_dateFrom,
    end_dateTo: end_dateTo,
  });

  res.status(200).json({
    status: "success",
    ...result,
  });
});
