import express from "express";
import multer from "multer";
import { verifyToken } from "../middleware/auth.js";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Dynamic imports for CommonJS modules
let pdf;
let mammoth;

// Load modules dynamically
(async () => {
  try {
    pdf = await import("pdf-parse");
    mammoth = await import("mammoth");
    console.log("✅ PDF and Mammoth modules loaded successfully");
  } catch (error) {
    console.error("❌ Failed to load modules:", error.message);
  }
})();

// Parse resume endpoint
router.post(
  "/parse-resume",
  verifyToken,
  upload.single("resume"),
  async (req, res) => {
    try {
      const file = req.file;
      if (!file) {
        return res
          .status(400)
          .json({ success: false, error: "No file uploaded" });
      }

      // Check if modules are loaded
      if (!pdf || !mammoth) {
        return res.status(500).json({
          success: false,
          error: "PDF parsing modules not loaded. Please try again.",
        });
      }

      let text = "";

      // Parse based on file type
      if (file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(file.path);
        const data = await pdf.default(dataBuffer); // Note: .default for pdf-parse
        text = data.text;
      } else if (
        file.mimetype === "application/msword" ||
        file.mimetype ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const result = await mammoth.default.extractRawText({
          path: file.path,
        });
        text = result.value;
      } else if (file.mimetype === "text/plain") {
        text = fs.readFileSync(file.path, "utf8");
      } else {
        // Clean up file
        fs.unlinkSync(file.path);
        return res
          .status(400)
          .json({ success: false, error: "Unsupported file type" });
      }

      // Extract information
      const parsedData = {
        summary: extractSummary(text),
        skills: extractSkills(text),
        experience: extractExperience(text),
        education: extractEducation(text),
        name: extractName(text),
        email: extractEmail(text),
        phone: extractPhone(text),
      };

      // Clean up uploaded file
      fs.unlinkSync(file.path);

      res.json({
        success: true,
        data: parsedData,
      });
    } catch (error) {
      console.error("Resume parsing error:", error);
      // Clean up file if exists
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
        } catch (e) {}
      }
      res.status(500).json({ success: false, error: "Failed to parse resume" });
    }
  }
);

// Helper functions
function extractSummary(text) {
  const summaryKeywords = ["summary", "profile", "about", "objective"];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some((keyword) => line.includes(keyword))) {
      return lines
        .slice(i + 1, i + 4)
        .join(" ")
        .trim();
    }
  }
  return "";
}

function extractSkills(text) {
  const commonSkills = [
    "JavaScript",
    "Python",
    "React",
    "Node.js",
    "Java",
    "C++",
    "SQL",
    "AWS",
    "Docker",
    "Kubernetes",
    "MongoDB",
    "Express",
    "TypeScript",
    "HTML",
    "CSS",
    "Git",
    "REST API",
    "GraphQL",
    "Redux",
    "Next.js",
    "Vue.js",
    "Angular",
    "PHP",
    "Ruby",
    "Swift",
    "Kotlin",
    "Flutter",
  ];

  const foundSkills = [];
  commonSkills.forEach((skill) => {
    if (text.toLowerCase().includes(skill.toLowerCase())) {
      foundSkills.push(skill);
    }
  });

  return foundSkills;
}

function extractExperience(text) {
  const match = text.match(/(\d+)\+?\s*years?/i);
  return match ? parseInt(match[1]) : 0;
}

function extractEducation(text) {
  const degrees = [
    "Bachelor",
    "Master",
    "PhD",
    "B.Sc",
    "M.Sc",
    "B.Tech",
    "M.Tech",
  ];
  const found = [];
  degrees.forEach((degree) => {
    if (text.includes(degree)) {
      found.push(degree);
    }
  });
  return found;
}

function extractName(text) {
  const lines = text.split("\n").filter((line) => line.trim());
  return lines.length > 0 ? lines[0].trim() : "";
}

function extractEmail(text) {
  const match = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/);
  return match ? match[1] : "";
}

function extractPhone(text) {
  const match = text.match(/(\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/);
  return match ? match[0] : "";
}

export default router;
