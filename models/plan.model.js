const mongoose = require("mongoose");

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["starter", "plus", "enterprise"],
      required: true,
    },
    price: { type: Number, required: true },
    trialDays: { type: Number, default: 0 },
    features: [String],
    stripePriceId: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
