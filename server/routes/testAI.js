import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

// Test endpoint for Gemini
router.post("/test-gemini", async (req, res) => {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt =
      "Generate one simple interview question for a React developer";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({
      success: true,
      message: "Gemini is working!",
      response: text,
    });
  } catch (error) {
    console.error("Gemini test failed:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
