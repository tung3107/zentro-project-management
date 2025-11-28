const CommentService = require("../services/comment.service");
const { catchAsync } = require("../utils/catchAsync");

exports.getAllCommentsByTask = catchAsync(async (req, res, next) => {
  const { task_id } = req.params;

  const data = await new CommentService().getAllCommentByTask(task_id);

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.postComment = catchAsync(async (req, res, next) => {
  const user_id = req.user.user_id;
  const { task_id, content } = req.body;

  const data = await new CommentService().postAComment(
    { task_id, content },
    user_id
  );

  res.status(201).json({
    status: "success",
    data,
  });
});

exports.updateComment = catchAsync(async (req, res, next) => {
  const user_id = req.user.user_id;
  const { comment_id } = req.params;
  const { content } = req.body;

  const data = await new CommentService().updateComment(
    comment_id,
    content,
    user_id
  );

  res.status(200).json({
    status: "success",
    data,
  });
});

exports.deleteComment = catchAsync(async (req, res, next) => {
  const user_id = req.user.user_id;
  const { comment_id } = req.params;

  await new CommentService().deleteComment(comment_id, user_id);

  res.status(200).json({
    status: "success",
    message: "Comment deleted successfully",
  });
});
