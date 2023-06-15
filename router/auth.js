const express = require("express");
const authController = require("../controller/auth");
const router = express.Router();

router.get("/signup", authController.getSignUp);
router.post("/signup", authController.postSignUp);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.getLogOut);
router.get("/passwordRecovery", authController.getPasswordRecovery);
router.post("/passwordRecovery", authController.postPasswordRecovery);
router.get("/newPassword/:token", authController.getNewPassword);
router.post("/newPassword", authController.postNewPassword);
router.get("/verify/:email/:token", authController.verifyAccount);

module.exports = router;
