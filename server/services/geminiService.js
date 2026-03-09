import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateInterviewQuestions = async (config) => {
  const {
    role,
    experience,
    techStack,
    interviewType,
    difficulty,
    numQuestions,
    focusAreas = [],
    excludedTopics = [],
  } = config;

  const prompt = `
  You are an expert technical interviewer conducting a **theoretical interview**.

  Generate ${numQuestions} **basic conceptual interview questions** for a ${experience} level ${role} position.
  
  Interview Type: ${interviewType}
  Difficulty Level: ${difficulty}
  Technologies to cover: ${techStack.join(", ")}
  ${focusAreas.length ? `Focus on these areas: ${focusAreas.join(", ")}` : ""}
  ${
    excludedTopics.length
      ? `Avoid these topics: ${excludedTopics.join(", ")}`
      : ""
  }
  
  ### **Important Guidelines:**
  - Questions should test **conceptual understanding only**, NOT implementation details
  - Focus on "what", "why", and core principles rather than "how to implement"
  - Avoid asking for code writing, system design, or practical implementation
  - Questions should be answerable in 2-3 sentences explaining the concept
  - Keep questions fundamental and beginner-friendly
  - Include a mix of:
    * Definition-based questions (e.g., "What is X?")
    * Comparison questions (e.g., "What's the difference between X and Y?")
    * Scenario-based conceptual questions (e.g., "When would you use X instead of Y?")
  
  ### **Examples of Good Theoretical Questions:**
  - "What is React and why would you use it?"
  - "Explain the difference between var, let, and const in JavaScript"
  - "What is a REST API and what are its main principles?"
  - "Explain the concept of state in React"
  - "What is MongoDB and when would you use it?"
  - "What is the purpose of Node.js?"
  - "Explain what a Promise is in JavaScript"
  
  ### **Examples of Questions to AVOID (too implementation-focused):**
  - "Write a function that does X" ❌
  - "How would you implement Y?" ❌
  - "Design a system for Z" ❌
  - "Write code to solve this problem" ❌
  
  For each question, provide:
  1. **question**: The question text (should be theoretical/conceptual)
  2. **type**: "technical" (most questions), "behavioral", or "system-design" (use sparingly)
  3. **category**: The technology or area (e.g., "React", "JavaScript", "Databases")
  4. **difficulty**: "easy", "medium", or "hard" (keep most at easy/medium for theoretical)
  5. **expectedPoints**: Array of 2-4 key concepts that should be mentioned in answer
  6. **sampleAnswer**: A brief 2-3 sentence conceptual explanation
  
  Format the response as a JSON object with this exact structure:
  {
    "questions": [
      {
        "question": "string",
        "type": "technical" | "behavioral" | "system-design",
        "category": "string",
        "difficulty": "easy" | "medium" | "hard",
        "expectedPoints": ["string"],
        "sampleAnswer": "string"
      }
    ]
  }
  
  Make sure all questions test **conceptual understanding**, not implementation skills.
  Return ONLY the JSON object, no other text.
`;

  try {
    // 🔥 FIX 1: Use the correct model name with 'models/' prefix
    const modelName = "models/gemini-2.5-flash"; // or "models/gemini-2.5-flash"
    console.log("🤖 Calling Gemini API with model:", modelName);
    console.log("📝 Prompt length:", prompt.length);

    const model = genAI.getGenerativeModel({ model: modelName });

    console.log("⏳ Waiting for response...");
    const result = await model.generateContent(prompt);
    console.log("✅ Got response from Gemini");

    const response = await result.response;
    const text = response.text();
    console.log("📄 Response text length:", text.length);
    console.log("📄 Response preview:", text.substring(0, 200));

    // 🔥 FIX 2: Better JSON parsing
    let parsedResponse;
    try {
      // Try to parse the entire response as JSON first
      parsedResponse = JSON.parse(text);
    } catch (e) {
      // If that fails, try to extract JSON from the text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    }

    // Validate the response structure
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error("Invalid response structure: missing questions array");
    }

    console.log(
      `✅ Successfully parsed ${parsedResponse.questions.length} questions`
    );
    return parsedResponse;
  } catch (error) {
    console.error("❌ Gemini API error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });

    // Log the full error object
    console.error("Full error:", JSON.stringify(error, null, 2));

    // 🔥 FIX 3: Return a more helpful error
    throw new Error(`Failed to generate questions: ${error.message}`);
  }
};

export const generateFollowUpQuestion = async (
  conversation,
  question,
  answer
) => {
  const prompt = `
    You are conducting a live interview. Based on the candidate's previous answer, generate a relevant follow-up question.
    
    Previous question: "${question}"
    Candidate's answer: "${answer}"
    
    Generate a natural follow-up question that:
    1. Probes deeper into the topic
    2. Tests understanding, not memorization
    3. Is challenging but fair
    
    Return only the question text, no other text.
  `;

  try {
    // 🔥 FIX: Use the same model naming convention
    const model = genAI.getGenerativeModel({
      model: "models/gemini-2.5-flash",
    });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return text.trim();
  } catch (error) {
    console.error("Follow-up generation error:", error);
    return null;
  }
};
