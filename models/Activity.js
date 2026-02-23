const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  Teacher_id: String,
  Teacher_name: String,
  Activity_type: String,
  Created_at: Date,
  Subject: String,
  Grade: Number
}, { collection: "activities" });

activitySchema.index(
  { Teacher_id: 1, Activity_type: 1, Created_at: 1 },
  { unique: true }
);


module.exports = mongoose.model("Activity", activitySchema);