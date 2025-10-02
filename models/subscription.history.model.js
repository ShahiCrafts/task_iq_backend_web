const mongoose = require("mongoose");

const subscriptionHistorySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: {
      type: String,
      enum: ["starter", "plus", "enterprise"],
      required: true,
    },
    status: {
      type: String,
      enum: ["trial", "active", "cancelled"],
      default: "active",
    },
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    notes: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SubscriptionHistory",
  subscriptionHistorySchema
);
