const express = require("express");
const authController = require("../controller/auth");
const router = express.Router();

router.get("/api/sessions/oauth/google", authController.googleOAuthHandler);

module.exports = router;
