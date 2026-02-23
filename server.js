const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Activity = require("./models/Activity");

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connect
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch(err => console.log("Mongo Error:", err));

// Test Route
app.get("/", (req, res) => {
  res.send("Server Running 🚀");
});

// Fetch All Data
app.get("/api/test-data", async (req, res) => {
  try {
    const data = await Activity.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Summary Route
app.get("/api/summary", async (req, res) => {
  try {
    const summary = await Activity.aggregate([
      {
        $group: {
          _id: "$Teacher_name",
          quizzes: {
            $sum: { $cond: [{ $eq: ["$Activity_type", "Quiz"] }, 1, 0] }
          },
          lessons: {
            $sum: { $cond: [{ $eq: ["$Activity_type", "Lesson Plan"] }, 1, 0] }
          },
          questionPapers: {
            $sum: { $cond: [{ $eq: ["$Activity_type", "Question Paper"] }, 1, 0] }
          }
        }
      }
    ]);

    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Weekly Trend Route
app.get("/api/weekly-trend", async (req, res) => {
  try {
    const weekly = await Activity.aggregate([
      {
        $addFields: {
          parsedDate: {
            $dateFromString: {
              dateString: "$Created_at",
              format: "%Y-%m-%d %H:%M:%S"
            }
          }
        }
      },
      {
        $group: {
          _id: { $week: "$parsedDate" },
          totalActivities: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json(weekly);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});
// Per Teacher Analysis Route
// Per Teacher Analysis Route
app.get("/api/teacher/:name", async (req, res) => {
  try {
    const teacherName = decodeURIComponent(req.params.name);

    const result = await Activity.aggregate([
      {
        $match: { Teacher_name: teacherName }
      },
      {
        $group: {
          _id: "$Teacher_name",
          quizzes: {
            $sum: { $cond: [{ $eq: ["$Activity_type", "Quiz"] }, 1, 0] }
          },
          lessons: {
            $sum: { $cond: [{ $eq: ["$Activity_type", "Lesson Plan"] }, 1, 0] }
          },
          questionPapers: {
            $sum: { $cond: [{ $eq: ["$Activity_type", "Question Paper"] }, 1, 0] }
          },
          total: { $sum: 1 }
        }
      }
    ]);

    res.json(result[0] || { message: "Teacher not found" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});