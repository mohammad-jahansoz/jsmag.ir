const express = require("express");
const adminController = require("../controller/admin");
const authController = require("../controller/auth");
const isAdmin = require("../util/isAdmin");

const router = express.Router();

router.get("/login", authController.getAdminLogin);
router.post("/login", authController.postAdminLogin);
router.get("/logout", authController.getAdminLogout);

router.get("/setting/upload", adminController.getUpload);
router.post("/setting/upload", adminController.postUpload);

router.get("/setting/files/:type", adminController.getUploadFiles);

router.get(
  "/comments/delete/:postId/:commentId",
  isAdmin,
  adminController.getDeleteComment
);

router.post(
  "/comments/update/:postId/:commentId",
  isAdmin,
  adminController.postUpdateComment
);
router.get(
  "/users/comments/:userEmail",
  isAdmin,
  adminController.getCommentsOfSingleUser
);
router.post("/posts/search", isAdmin, adminController.adminPostSearch);
router.post("/users/search", isAdmin, adminController.postSearchUser);
router.get("/user/sendEmail/:userEmail", isAdmin, adminController.getSendEmail);
router.post("/user/sendEmail", isAdmin, adminController.postSendEmail);
router.get("/user/sendEmail", isAdmin, adminController.getSendEmail);
router.get(
  "/users/likes/:userEmail",
  isAdmin,
  adminController.getLikesOfSingleUser
);
router.get("/users", isAdmin, adminController.getUsers);
router.get("/likes/:postId", isAdmin, adminController.getLikesOfSinglePost);
router.get(
  "/comment/:postId",
  isAdmin,
  adminController.getCommentsOfSinglePost
);
router.get("/comments", isAdmin, adminController.getComments);
router.get("/add-post", isAdmin, adminController.getAddPost);
router.post(
  "/posts/update-post/:type/:path",
  isAdmin,
  adminController.postUpdatePost
);
router.get("/posts", isAdmin, adminController.getPosts);
router.post("/add-post/:type/:path", isAdmin, adminController.postAddPost);
router.get(
  "/posts/delete-post/:postId",
  isAdmin,
  adminController.getDeletePost
);
router.get(
  "/posts/update-post/:postId",
  isAdmin,
  adminController.getUpdatePost
);

router.get("/setting/slider/delete/:sliderId", adminController.getDeleteSlider);

router.get("/setting/slider/add-new", adminController.getAddSlider);
router.get("/setting/slider/edit/:sliderId", adminController.getEditSlide);
router.get("/setting/slider/management", adminController.getSlider);
router.post("/setting/slider/:type/:path", adminController.postSliders);
router.post("/setting/slider/edit", adminController.postEditSlide);
router.get("/setting", adminController.getSetting);

module.exports = router;
