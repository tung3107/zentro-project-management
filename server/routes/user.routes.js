const express = require("express");
const { protectRoute, authorize } = require("../controllers/auth.controller");
const {
  createUser,
  updateUserAdmin,
  updateUserProfile,
  getAllUserWithParam,
  getAllUser,
  deleteOneUser,
  resetUserPassword,
  searchUserForProject,
  getOneUser,
} = require("../controllers/user.controller");
const upload = require("../middlewares/upload");

const routes = express.Router();

routes.route("/search").get(protectRoute, searchUserForProject);
routes.route("/update-profile").put(protectRoute, updateUserProfile);

routes
  .route("/")
  .get(protectRoute, authorize("user", "read"), getAllUserWithParam)
  .post(
    protectRoute,
    authorize("user", "create"),
    upload.single("avatar"),
    createUser
  );

routes
  .route("/reset-user-password")
  .post(protectRoute, authorize("user", "update"), resetUserPassword);

routes
  .route("/leader")
  .get(protectRoute, authorize("user", "read"), getAllUser);

routes
  .route("/:user_id")
  .get(protectRoute, getOneUser)
  .put(
    protectRoute,
    authorize("user", "update"),
    upload.single("avatar"),
    updateUserAdmin
  )
  .delete(protectRoute, authorize("user", "delete"), deleteOneUser);

module.exports = routes;
