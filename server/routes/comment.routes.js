const express = require("express");
const { protectRoute } = require("../controllers/auth.controller");
const {
  getAllCommentsByTask,
  postComment,
  updateComment,
  deleteComment,
} = require("../controllers/comment.controller");

const routes = express.Router();

routes.route("/task/:task_id").get(protectRoute, getAllCommentsByTask);

routes.route("/").post(protectRoute, postComment);

routes
  .route("/:comment_id")
  .put(protectRoute, updateComment)
  .delete(protectRoute, deleteComment);

module.exports = routes;
