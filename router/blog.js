const express = require("express");
const router = express.Router();
const blogController = require("../controller/blog");

router.get("/setting/likes/:email", blogController.getLikesOfSingleUser);
router.get("/setting", blogController.getSetting);
router.post("/setting/profile/:type/:path", blogController.postProfileSetting);
router.get("/setting/profile", blogController.getProfileSetting);
router.post("/post/comment/:postId", blogController.postComment);
router.post("/post/like/:postId", blogController.postLike);
router.get("/post/:postId", blogController.getPost);
router.post("/posts/search", blogController.postSearch);
router.get("/posts/category/:category", blogController.getPostsByCategory);
router.get("/", blogController.getPosts);

module.exports = router;
