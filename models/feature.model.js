const mongoose = require("mongoose");

const featureSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    allowedTiers: [{ type: String, enum: ["starter", "plus", "enterprise"] }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feature", featureSchema);
