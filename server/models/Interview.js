import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["technical", "behavioral", "system-design"],
    required: true,
  },
  category: String,
  difficulty: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium",
  },
  answer: {
    text: String,
    audioUrl: String,
    duration: Number,
  },
  feedback: {
    score: {
      type: Number,
      min: 0,
      max: 10,
    },
    strengths: [String],
    improvements: [String],
    sampleAnswer: String,
    evaluatedAt: Date,
  },
  timeSpent: Number,
  skipped: {
    type: Boolean,
    default: false,
  },
});

const interviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    firebaseUid: {
      type: String,
      required: true,
      index: true,
    },

    // Interview configuration (editable copy from user settings)
    config: {
      role: {
        type: String,
        required: true,
      },
      experience: {
        type: String,
        enum: ["entry", "junior", "mid", "senior", "lead"],
        required: true,
      },
      techStack: [String],
      interviewType: {
        type: String,
        enum: ["technical", "behavioral", "mixed"],
        default: "mixed",
      },
      difficulty: {
        type: String,
        enum: ["easy", "medium", "hard"],
        default: "medium",
      },
      numQuestions: {
        type: Number,
        default: 5,
        min: 1,
        max: 20,
      },
      duration: Number,
      focusAreas: [String], // Specific topics to focus on
      excludedTopics: [String], // Topics to skip
    },

    // Questions generated for this interview
    questions: [questionSchema],

    // Interview statistics
    stats: {
      totalQuestions: Number,
      answeredQuestions: Number,
      skippedQuestions: Number,
      averageScore: Number,
      totalTime: Number,
      completionRate: Number,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "evaluated"],
      default: "pending",
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    evaluatedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Calculate stats before saving
interviewSchema.pre("save", function (next) {
  if (this.questions && this.questions.length > 0) {
    const answered = this.questions.filter(
      (q) => q.answer?.text || q.answer?.audioUrl
    );
    const scored = this.questions.filter((q) => q.feedback?.score);

    this.stats = {
      totalQuestions: this.questions.length,
      answeredQuestions: answered.length,
      skippedQuestions: this.questions.filter((q) => q.skipped).length,
      averageScore:
        scored.length > 0
          ? scored.reduce((acc, q) => acc + q.feedback.score, 0) / scored.length
          : 0,
      totalTime: this.questions.reduce((acc, q) => acc + (q.timeSpent || 0), 0),
      completionRate: (answered.length / this.questions.length) * 100,
    };
  }
  next();
});

const Interview = mongoose.model("Interview", interviewSchema);

export default Interview;
