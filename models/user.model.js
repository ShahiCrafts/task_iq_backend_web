const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const crypto = require("crypto");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, "Invalid email!"],
    },

    password: {
      type: String,
      required: function () {
        return !this.googleId;
      },
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },

    role: {
      type: String,
      enum: ["user", "manager", "admin"],
      default: "user",
    },

    lastLogin: {
      type: Date,
    },

    mfaEnabled: {
      type: Boolean,
      default: false,
    },

    mfaSecret: {
      type: String,
    },

    mfaBackupCodes: [
      {
        type: String,
      },
    ],

    aiPreferences: {
      suggestPriority: {
        type: Boolean,
        default: true,
      },
      focusMode: {
        type: Boolean,
        default: false,
      },
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    verificationToken: {
      type: String,
    },

    verificationTokenExpires: Date,

    googleId: {
      type: String,
    },

    subscription: {
      tier: {
        type: String,
        enum: ["starter", "plus", "enterprise"],
        default: "starter",
      },
      active: { type: Boolean, default: true },
      startedAt: { type: Date, default: Date.now },
      trialEndsAt: Date,
      stripeCustomerId: String,
      stripeSubscriptionId: String,
    },

    resetPasswordToken: String,
    resetPasswordExpires: Date,
  },
  {
    timestamps: true,
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.createVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.verificationToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");
  this.verificationTokenExpires = Date.now() + 60 * 60 * 60 * 1000;
  console.log(this.verificationToken);
  console.log(this.verificationTokenExpires);
  return rawToken;
};

userSchema.methods.createPasswordResetToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
  return rawToken;
};

userSchema.methods.canLogin = function () {
  return this.isVerified || !!this.googleId;
};

userSchema.methods.isSubscriptionActive = function () {
  if (this.subscription.tier === "starter") return true;
  if (this.subscription.trialEndsAt) {
    return new Date() <= this.subscription.trialEndsAt;
  }
  return this.subscription.active;
};

module.exports = mongoose.model("User", userSchema);
