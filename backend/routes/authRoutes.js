const express = require("express");
const router = express.Router();
const passport = require("../config/passport");
const jwt = require("jsonwebtoken");
const {
  register,
  login,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const logAction = require("../utils/logAction");
const CLIENT_URL = process.env.CLIENT_URL

router.post("/register", register);
router.post("/login", login);

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  async (req, res) => {
    if (!req.user) {
      console.log("Google login failed: no user returned.");
      return res.redirect(
        `${CLIENT_URL}/social-login?error=login_failed`
      );
    }

    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await logAction(req.user.id, req.user.username, "Google Login");

    res.redirect(
      `${CLIENT_URL}/social-login?token=${token}&role=${req.user.role}`
    );
  }
);

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    if (!req.user) {
      return res.redirect(
        `${CLIENT_URL}/social-login?error=login_failed`
      );
    }

    const token = jwt.sign(
      { id: req.user.id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await logAction(req.user.id, req.user.username, "GitHub Login");

    res.redirect(
      `${CLIENT_URL}/social-login?token=${token}&role=${req.user.role}`
    );
  }
);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
