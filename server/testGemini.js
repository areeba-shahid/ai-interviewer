import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

async function testGemini() {
  try {
    console.log(
      "🔑 API Key:",
      process.env.GEMINI_API_KEY ? "✅ Loaded" : "❌ Missing"
    );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    // Try both models
    const models = ["gemini-1.5-pro", "gemini-1.0-pro"];

    for (const modelName of models) {
      console.log(`\n🤖 Testing model: ${modelName}`);
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent("Say 'Hello' in one word");
        const response = await result.response;
        console.log(`✅ ${modelName} works! Response:`, response.text());
      } catch (e) {
        console.log(`❌ ${modelName} failed:`, e.message);
      }
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
}

testGemini();
