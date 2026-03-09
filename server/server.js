import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import interviewRoutes from "./routes/InterviewRoutes.js";
import aiRoutes from "./routes/aiInterviewRoutes.js";
import User from "./models/User.js";
import Interview from "./models/Interview.js";
import resumeRoutes from "./routes/ResumeRoutes.js";
import testAIRoutes from "./routes/testAI.js";
import notificationRoutes from "./routes/notificationRoutes.js";

dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// 🔥 FIX: Increase payload limit for large base64 images
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);

// Routes
app.use("/api", resumeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/interviews", interviewRoutes);
// Add to server.js
app.use("/api/notifications", notificationRoutes);
app.use("/api/ai", aiRoutes);
// Check if Gemini API key is set
if (!process.env.GEMINI_API_KEY) {
  console.error("❌ GEMINI_API_KEY is not set in environment variables");
} else {
  console.log("✅ Gemini API key is configured");
}
// 1. Check all users in database
app.get("/api/test/users", async (req, res) => {
  try {
    const users = await User.find({}).select("-__v");
    console.log(`📊 Found ${users.length} users in database`);
    res.json({
      success: true,
      count: users.length,
      data: users,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. Check specific user by Firebase UID (add ?uid=xxx)
app.get("/api/test/user", async (req, res) => {
  try {
    const { uid } = req.query;
    if (!uid) {
      return res.json({ success: false, error: "Provide uid parameter" });
    }

    const user = await User.findOne({ firebaseUid: uid });
    if (user) {
      res.json({ success: true, data: user });
    } else {
      res.json({ success: false, message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. Check all interviews
app.get("/api/test/interviews", async (req, res) => {
  try {
    const interviews = await Interview.find({}).populate("user", "name email");
    res.json({
      success: true,
      count: interviews.length,
      data: interviews,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. Force create a test user (for debugging)
app.post("/api/test/create-user", async (req, res) => {
  try {
    const { uid, email, name } = req.body;

    if (!uid || !email) {
      return res.status(400).json({ error: "uid and email required" });
    }

    const user = await User.create({
      firebaseUid: uid,
      email: email,
      name: name || email.split("@")[0],
      photoURL: "",
    });

    console.log("✅ Test user created:");
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date().toISOString(),
  });
});

// 🔥 Improved error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Error:", err);

  // Handle payload too large error specifically
  if (err.type === "entity.too.large" || err.message?.includes("too large")) {
    return res.status(413).json({
      success: false,
      error: "Payload too large. Please reduce image size (max 5MB).",
    });
  }

  res.status(500).json({
    success: false,
    error: err.message || "Something went wrong!",
  });
});

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📸 Payload limit increased to 50mb for image uploads`);
});
