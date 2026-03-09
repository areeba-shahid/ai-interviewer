import Interview from "../models/Interview.js";
import User from "../models/User.js";

// Create new interview
export const createInterview = async (req, res) => {
  try {
    const interviewData = {
      ...req.body,
      firebaseUid: req.user.uid,
      user: req.dbUser._id,
      startedAt: new Date(),
    };

    const interview = await Interview.create(interviewData);

    // Add interview to user's interviews array
    await User.findByIdAndUpdate(req.dbUser._id, {
      $push: { interviews: interview._id },
    });

    res.status(201).json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("Create interview error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to create interview",
    });
  }
};

// Get all user interviews
export const getUserInterviews = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, role } = req.query;

    const query = { firebaseUid: req.user.uid };

    if (status) query.status = status;
    if (role) query.role = { $regex: role, $options: "i" };

    const interviews = await Interview.find(query)
      .sort("-createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select("role status stats createdAt");

    const total = await Interview.countDocuments(query);

    res.json({
      success: true,
      data: interviews,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Get interviews error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch interviews",
    });
  }
};

// Get single interview
export const getInterview = async (req, res) => {
  try {
    const interview = await Interview.findOne({
      _id: req.params.id,
      firebaseUid: req.user.uid,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: "Interview not found",
      });
    }

    res.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("Get interview error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch interview",
    });
  }
};

// Update interview
export const updateInterview = async (req, res) => {
  try {
    const interview = await Interview.findOneAndUpdate(
      { _id: req.params.id, firebaseUid: req.user.uid },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: "Interview not found",
      });
    }

    // Update user stats if interview completed
    if (req.body.status === "completed" && interview.stats) {
      await User.findOneAndUpdate(
        { firebaseUid: req.user.uid },
        {
          $inc: {
            "stats.totalInterviews": 1,
            "stats.totalQuestions": interview.stats.answeredQuestions || 0,
            "stats.practiceHours": (interview.stats.totalTime || 0) / 3600,
          },
          $set: {
            "stats.averageScore": interview.stats.averageScore || 0,
          },
        }
      );
    }

    res.json({
      success: true,
      data: interview,
    });
  } catch (error) {
    console.error("Update interview error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update interview",
    });
  }
};

// Delete interview
export const deleteInterview = async (req, res) => {
  try {
    const interview = await Interview.findOneAndDelete({
      _id: req.params.id,
      firebaseUid: req.user.uid,
    });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: "Interview not found",
      });
    }

    // Remove from user's interviews array
    await User.findByIdAndUpdate(req.dbUser._id, {
      $pull: { interviews: interview._id },
    });

    res.json({
      success: true,
      message: "Interview deleted successfully",
    });
  } catch (error) {
    console.error("Delete interview error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete interview",
    });
  }
};
