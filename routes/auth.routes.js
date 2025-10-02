const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  getUserStatus,
  setupProfile,
} = require("../controllers/auth.controller");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get("/verify-email", verifyEmail);
router.get("/user-status", getUserStatus);
router.post("/setup-account", setupProfile);
router.post("/resend-verification", resendVerificationEmail);

module.exports = router;
