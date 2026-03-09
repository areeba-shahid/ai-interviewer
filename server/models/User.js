import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    photoURL: {
      type: String,
      default: "",
    },

    // Personal Information
    phone: {
      type: String,
      default: "",
    },
    dateOfBirth: {
      type: String,
      default: "",
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say", ""],
      default: "",
    },
    headline: {
      type: String,
      default: "",
      maxlength: 100,
    },
    hearAboutUs: {
      type: String,
      default: "",
    },

    // Location
    country: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    address: {
      type: String,
      default: "",
    },
    postalCode: {
      type: String,
      default: "",
    },
    timezone: {
      type: String,
      default: "",
    },

    // Professional Information
    currentProfession: {
      type: String,
      default: "",
    },
    yearsOfExperience: {
      type: String,
      default: "",
    },
    experienceLevel: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead", ""],
      default: "entry",
    },
    employmentStatus: {
      type: String,
      default: "",
    },
    industry: {
      type: String,
      default: "",
    },
    company: {
      type: String,
      default: "",
    },

    // Professional Links
    linkedin: {
      type: String,
      default: "",
    },
    github: {
      type: String,
      default: "",
    },
    portfolio: {
      type: String,
      default: "",
    },

    // Skills & Expertise
    technicalSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    softSkills: [
      {
        type: String,
        trim: true,
      },
    ],
    languages: [
      {
        name: String,
        proficiency: {
          type: String,
          enum: ["Beginner", "Intermediate", "Fluent", "Native"],
          default: "Beginner",
        },
      },
    ],
    certifications: [
      {
        name: String,
        issuer: String,
        year: String,
        link: String,
      },
    ],

    // Bio & Resume
    bio: {
      type: String,
      default: "",
      maxlength: 500,
    },
    resumeFile: {
      type: String, // Store file path or URL
      default: "",
    },
    resumeFileName: {
      type: String,
      default: "",
    },

    // Job Preferences
    jobSearchStatus: {
      type: String,
      default: "",
    },
    preferredJobTypes: [
      {
        type: String,
      },
    ],
    expectedSalary: {
      type: String,
      default: "",
    },
    remotePreference: {
      type: String,
      default: "",
    },

    // Location (keeping for backward compatibility)
    location: {
      type: String,
      default: "",
    },
    profession: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      enum: ["entry", "junior", "mid", "senior", "lead"],
      default: "entry",
    },
    skills: [
      {
        type: String,
        trim: true,
      },
    ],

    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: {
        type: String,
        default: "en",
      },
    },

    stats: {
      totalInterviews: {
        type: Number,
        default: 0,
      },
      averageScore: {
        type: Number,
        default: 0,
      },
      totalQuestions: {
        type: Number,
        default: 0,
      },
      practiceHours: {
        type: Number,
        default: 0,
      },
    },

    interviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interview",
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Update the updatedAt field on save
userSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Method to return user without sensitive data
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.__v;
  return user;
};

const User = mongoose.model("User", userSchema);

export default User;
