import express from "express";
import { verifyToken } from "../middleware/auth.js";
import Interview from "../models/Interview.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateInterviewQuestions } from "../services/geminiService.js";
const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Test endpoint
router.get("/test", verifyToken, (req, res) => {
  console.log("✅ Test endpoint hit");
  res.json({ success: true, message: "AI routes are working" });
});
router.post("/generate-questions", verifyToken, async (req, res) => {
  console.log("=".repeat(50));
  console.log("📥 Received generate-questions request");

  try {
    const { config } = req.body;

    // Log the received config
    console.log("Received config:", JSON.stringify(config, null, 2));

    if (!config) {
      console.error("❌ No config provided");
      return res
        .status(400)
        .json({ success: false, error: "Config is required" });
    }

    // Validate required fields
    if (!config.role) {
      console.error("❌ Missing role in config");
      return res
        .status(400)
        .json({ success: false, error: "Role is required" });
    }

    if (!config.techStack || !Array.isArray(config.techStack)) {
      console.error("❌ Missing or invalid techStack");
      return res
        .status(400)
        .json({ success: false, error: "Tech stack is required" });
    }

    console.log("🤖 Calling generateInterviewQuestions from service...");

    // Call the service function
    const questions = await generateInterviewQuestions(config);

    console.log("✅ Questions generated successfully");
    console.log(`Generated ${questions.questions?.length || 0} questions`);

    res.json({
      success: true,
      data: questions,
    });
  } catch (error) {
    console.error("❌ Question generation error:", error);
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    res.status(500).json({
      success: false,
      error: error.message || "Failed to generate questions",
    });
  }
});
// Evaluate a single answer
// Evaluate a single answer
router.post("/evaluate-answer", verifyToken, async (req, res) => {
  console.log("=".repeat(50));
  console.log("📥 Received evaluate-answer request");
  console.log("Request body:", JSON.stringify(req.body, null, 2));

  try {
    const { question, answer, expectedPoints, interviewId, questionIndex } =
      req.body;

    // Detailed validation with specific error messages
    const missingFields = [];
    if (!question) missingFields.push("question");
    if (!answer) missingFields.push("answer");
    if (!interviewId) missingFields.push("interviewId");
    if (questionIndex === undefined) missingFields.push("questionIndex");

    if (missingFields.length > 0) {
      console.error("❌ Missing required fields:", missingFields);
      return res.status(400).json({
        success: false,
        error: `Missing required fields: ${missingFields.join(", ")}`,
      });
    }

    // Check if interview exists
    const interview = await Interview.findById(interviewId);
    if (!interview) {
      console.error("❌ Interview not found:", interviewId);
      return res
        .status(404)
        .json({ success: false, error: "Interview not found" });
    }

    // Check if question index is valid
    if (questionIndex < 0 || questionIndex >= interview.questions.length) {
      console.error("❌ Invalid question index:", questionIndex);
      return res
        .status(400)
        .json({ success: false, error: "Invalid question index" });
    }

    console.log("Question:", question.substring(0, 100) + "...");
    console.log("Answer:", answer.substring(0, 100) + "...");
    console.log("Expected points:", expectedPoints);
    console.log("Interview ID:", interviewId);
    console.log("Question Index:", questionIndex);

    // Check if API key exists and quota
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ GEMINI_API_KEY not found");
      return res
        .status(500)
        .json({ success: false, error: "API key not configured" });
    }

    const prompt = `
    You are an expert interviewer giving **short feedback** on a candidate's answer.
    
    Question: "${question}"
    
    Expected key points: ${expectedPoints?.join(", ") || "Not specified"}
    
    Candidate's answer: "${answer}"
    
    **Evaluation Rules:**
    - Score from 0-10 (give at least 4 if answer is relevant, if not then 0 )
    - Keep feedback **EXTREMELY SHORT**
    - Strengths and improvements: half half each
    - Summary: 10-15 words maximum
    
    Format your response as JSON:
    {
      "score": number,
      "feedback": {
        "strengths": ["string"],
        "improvements": ["string"],
        "summary": "string"
      }
    }
    
    Return ONLY the JSON, no other text.
    `;

    console.log("🤖 Sending to Gemini...");
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    }); // Switch to 1.5-flash to avoid quota issues

    let evaluation;
    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("Invalid response format");
      }

      evaluation = JSON.parse(jsonMatch[0]);
      console.log(`✅ Got evaluation with score: ${evaluation.score}`);
    } catch (aiError) {
      console.error("❌ AI service error:", aiError);

      // Return a default evaluation if AI fails
      evaluation = {
        score: 5,
        feedback: {
          strengths: ["Attempted"],
          improvements: ["Needs detail"],
          summary: "Basic attempt, could be improved",
        },
      };
      console.log("⚠️ Using default evaluation due to AI error");
    }

    // 🔥 SAVE TO DATABASE
    interview.questions[questionIndex].answer = { text: answer };
    interview.questions[questionIndex].feedback = {
      score: evaluation.score,
      strengths: evaluation.feedback?.strengths || [],
      improvements: evaluation.feedback?.improvements || [],
      summary: evaluation.feedback?.summary || "",
      evaluatedAt: new Date(),
    };

    await interview.save();
    console.log(
      `✅ Saved to DB - Question ${questionIndex} | Score: ${evaluation.score}`
    );

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    console.error("❌ Evaluation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to evaluate answer",
    });
  }
});

// Evaluate complete interview
router.post("/evaluate-interview/:id", verifyToken, async (req, res) => {
  console.log("=".repeat(50));
  console.log("📥 Received evaluate-interview request for ID:", req.params.id);

  try {
    const interview = await Interview.findById(req.params.id);

    if (!interview) {
      console.error("❌ Interview not found:", req.params.id);
      return res.status(404).json({ error: "Interview not found" });
    }

    console.log("✅ Interview found. Questions:", interview.questions.length);

    // Calculate average score from all answered questions
    const answeredQuestions = interview.questions.filter((q) => q.answer?.text);
    console.log("Answered questions:", answeredQuestions.length);

    // 🔥 FIX 1: Calculate average correctly
    const averageScore =
      answeredQuestions.length > 0
        ? answeredQuestions.reduce(
            (acc, q) => acc + (q.feedback?.score || 0),
            0
          ) / answeredQuestions.length
        : 0;

    console.log("Average score:", averageScore);

    // Collect all strengths and improvements
    const allStrengths = [];
    const allImprovements = [];

    interview.questions.forEach((q) => {
      if (q.feedback) {
        allStrengths.push(...(q.feedback.strengths || []));
        allImprovements.push(...(q.feedback.improvements || []));
      }
    });

    // Remove duplicates
    const strengths = [...new Set(allStrengths)];
    const improvements = [...new Set(allImprovements)];

    // 🔥 FIX 2: Remove the 7-point threshold for pass/fail
    // Instead, use a simple message based on score
    let feedbackMessage = "";
    if (averageScore >= 8) {
      feedbackMessage =
        "Excellent performance! You demonstrated strong understanding.";
    } else if (averageScore >= 6) {
      feedbackMessage =
        "Good effort! You have solid understanding with room to grow.";
    } else if (averageScore >= 4) {
      feedbackMessage = "Fair attempt. Focus on strengthening core concepts.";
    } else {
      feedbackMessage =
        "Keep practicing! Review the fundamentals and try again.";
    }

    const result = {
      overallScore: averageScore.toFixed(1),
      totalQuestions: interview.questions.length,
      answeredQuestions: answeredQuestions.length,
      strengths: strengths.slice(0, 5),
      improvements: improvements.slice(0, 5),
      // 🔥 REMOVED the 'passed' field entirely
      feedback: feedbackMessage,
    };

    console.log("✅ Evaluation result:", result);

    // Update interview status
    interview.status = "evaluated";
    interview.evaluatedAt = new Date();
    await interview.save();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Final evaluation error:", error);
    res.status(500).json({
      success: false,
      error: error.message || "Failed to evaluate interview",
    });
  }
});

export default router;
