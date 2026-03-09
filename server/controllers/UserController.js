import User from "../models/User.js";
import Interview from "../models/Interview.js";

// In your userController.js, update the getProfile function:
//hehe
// Get user profile - exclude photo by default
export const getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid })
      .select("-__v -photoURL") // 👈 Exclude photoURL from default query
      .populate("interviews", "role status createdAt stats");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile",
    });
  }
};

// NEW: Get photo separately
export const getUserPhoto = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid }).select(
      "photoURL"
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    res.json({
      success: true,
      photoURL: user.photoURL,
    });
  } catch (error) {
    console.error("Get photo error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch photo",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const updates = {
      // Personal Info
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth,
      gender: req.body.gender,
      headline: req.body.headline,
      hearAboutUs: req.body.hearAboutUs,

      // 🔥 FIX: Include photoURL
      photoURL: req.body.photoURL,

      // Location
      country: req.body.country,
      city: req.body.city,
      address: req.body.address,
      postalCode: req.body.postalCode,
      timezone: req.body.timezone,
      location: req.body.location,

      // Professional Info
      currentProfession: req.body.currentProfession,
      profession: req.body.profession,
      yearsOfExperience: req.body.yearsOfExperience,
      experienceLevel: req.body.experienceLevel,
      experience: req.body.experience,
      employmentStatus: req.body.employmentStatus,
      industry: req.body.industry,
      company: req.body.company,

      // Professional Links
      linkedin: req.body.linkedin,
      github: req.body.github,
      portfolio: req.body.portfolio,

      // Skills
      skills: req.body.skills,
      technicalSkills: req.body.technicalSkills,
      softSkills: req.body.softSkills,

      // Languages & Certifications
      languages: req.body.languages,
      certifications: req.body.certifications,

      // Bio & Resume
      bio: req.body.bio,
      resumeFileName: req.body.resumeFileName,

      // Job Preferences
      jobSearchStatus: req.body.jobSearchStatus,
      preferredJobTypes: req.body.preferredJobTypes,
      expectedSalary: req.body.expectedSalary,
      remotePreference: req.body.remotePreference,

      // Preferences
      "preferences.emailNotifications": req.body.emailNotifications,
      "preferences.theme": req.body.theme,
      "preferences.language": req.body.language,
    };

    // Remove undefined fields
    Object.keys(updates).forEach(
      (key) => updates[key] === undefined && delete updates[key]
    );

    console.log("📝 Updating with:", updates);

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.user.uid },
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("✅ User updated:", user._id);
    console.log("📸 Photo URL in DB:", user.photoURL);

    res.json({
      success: true,
      data: user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
};

// Get user statistics
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }

    // Get recent interviews
    const recentInterviews = await Interview.find({ firebaseUid: req.user.uid })
      .sort("-createdAt")
      .limit(5)
      .select("role status stats createdAt");

    // Calculate overall stats
    const allInterviews = await Interview.find({ firebaseUid: req.user.uid });

    const totalInterviews = allInterviews.length;
    const completedInterviews = allInterviews.filter(
      (i) => i.status === "completed"
    ).length;
    const averageScore =
      allInterviews.reduce((acc, i) => acc + (i.stats?.averageScore || 0), 0) /
        totalInterviews || 0;

    // Skill breakdown
    const skillScores = {};
    allInterviews.forEach((interview) => {
      interview.questions?.forEach((q) => {
        if (q.category && q.feedback?.score) {
          if (!skillScores[q.category]) {
            skillScores[q.category] = { total: 0, count: 0 };
          }
          skillScores[q.category].total += q.feedback.score;
          skillScores[q.category].count += 1;
        }
      });
    });

    const skills = Object.entries(skillScores).map(([name, data]) => ({
      name,
      score: data.total / data.count,
    }));

    res.json({
      success: true,
      data: {
        overview: {
          totalInterviews,
          completedInterviews,
          averageScore: averageScore.toFixed(1),
          totalQuestions: user.stats?.totalQuestions || 0,
          practiceHours: user.stats?.practiceHours || 0,
        },
        recentInterviews,
        skills,
        stats: user.stats,
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch statistics",
    });
  }
};

// Delete user account
export const deleteAccount = async (req, res) => {
  try {
    // Delete all user interviews
    await Interview.deleteMany({ firebaseUid: req.user.uid });

    // Delete user
    await User.findOneAndDelete({ firebaseUid: req.user.uid });

    // Note: Firebase account deletion should be handled on frontend

    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    console.error("Delete account error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to delete account",
    });
  }
};
