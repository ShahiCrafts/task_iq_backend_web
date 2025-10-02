const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");
const { generateVerificationEmail } = require("../utils/emailTemplate");

const generateToken = (userId, role) => {
  return jwt.sign(
    {
      id: userId,
      role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

const generateRefreshToken = (userId) => {
  return jwt.sign(
    {
      id: userId,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const user = new User({
      email,
      password,
      role: "user",
      aiPreferences: {
        suggestPriority: true,
        focusMode: false,
      },
    });

    const verificationToken = user.createVerificationToken();
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${user.email}`;
    const htmlEmailTemplate = generateVerificationEmail(
      user.email,
      verificationUrl
    );

    console.log(
      `Email verification link: http://localhost:5173/verify-email?token=${verificationToken}&email=${email}`
    );

    await sendEmail(
      user.email,
      "Verify your Task IQ Account",
      htmlEmailTemplate
    );

    res.status(201).json({
      message:
        "User registered successfully. Please check your email to verify your account.",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token, email } = req.query;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    console.log("Token from query:", token);
    console.log("Hashed token:", hashedToken);
    console.log("Email from query:", email);

    const user = await User.findOne({
      email,
      verificationToken: hashedToken,
      verificationTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      const alreadyVerifiedUser = await User.findOne({
        email,
        isVerified: true,
      });
      if (alreadyVerifiedUser) {
        return res.status(200).json({
          success: true,
          message: "Email already verified. You can now log in.",
        });
      }

      return res.status(400).json({ message: "Invalid or expired token." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;

    await user.save();

    res.status(200).json({
      success: true,
      message: "Email verified successfully. You can now log in.",
    });
  } catch (error) {
    next(error);
  }
};

const resendVerificationEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ message: "Account doesnot exist with this email!" });
    if (user.isVerified)
      return res.status(400).json({ message: "Email already verified" });

    const verificationToken = user.createVerificationToken();
    await user.save();

    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}&email=${user.email}`;
    const htmlEmailTemplate = generateVerificationEmail(
      user.email,
      verificationUrl
    );

    console.log(
      `Resent email verification link: ${process.env.FRONTEND_URI}/verify-email?token=${verificationToken}&email=${email}`
    );
    await sendEmail(
      user.email,
      "Verify your SecureDoc Account",
      htmlEmailTemplate
    );

    res.status(200).json({ message: "Verification email resent" });
  } catch (error) {
    next(error);
  }
};

const getUserStatus = async (req, res, next) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ isVerified: user.isVerified });
  } catch (error) {
    next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.canLogin()) {
      return res
        .status(403)
        .json({ message: "Email not verified. Please verify your email." });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Incorrect Password!" });
    }

    if (user.mfaEnabled) {
      return res
        .status(200)
        .json({ message: "MFA required", mfaRequired: true });
    }

    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const accessToken = generateToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 6 * 1000,
    });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const setupProfile = async (req, res, next) => {
  try {
    const { fullName } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!user.isVerified) {
      return res.status(400).json({ message: "Email not verified yet" });
    }

    user.name = fullName;
    await user.save();

    res.status(200).json({ message: "Profile setup complete", user });
  } catch (error) {
    next(error);
  }
};

const logoutUser = (req, res) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
  });

  res.status(200).json({
    message: "Logout successful",
  });
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  verifyEmail,
  resendVerificationEmail,
  getUserStatus,
  setupProfile
};
