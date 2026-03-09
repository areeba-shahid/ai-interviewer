// This is a frontend utility for resume parsing
// It will send the file to your backend for actual parsing

export const parseResume = async (file) => {
  try {
    const formData = new FormData();
    formData.append("resume", file);

    const response = await fetch(
      `${import.meta.env.VITE_API_URL}/parse-resume`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Failed to parse resume");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Resume parsing error:", error);
    // Don't throw - just return empty data
    return {
      summary: "",
      skills: [],
      experience: 0,
      education: [],
      name: "",
      email: "",
      phone: "",
    };
  }
};

export const parseResumeLocally = async (file) => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      resolve({
        summary: "",
        skills: [],
        experience: 0,
        education: [],
        name: "",
        email: "",
        phone: "",
      });
    };

    reader.onerror = () => {
      resolve({
        summary: "",
        skills: [],
        experience: 0,
        education: [],
        name: "",
        email: "",
        phone: "",
      });
    };

    if (file.type === "text/plain") {
      reader.readAsText(file);
    } else {
      // For non-text files, just resolve with empty data
      resolve({
        summary: "",
        skills: [],
        experience: 0,
        education: [],
        name: "",
        email: "",
        phone: "",
      });
    }
  });
};

// Helper extraction functions for local parsing
function extractSummary(text) {
  const summaryKeywords = ["summary", "profile", "about", "objective"];
  const lines = text.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some((keyword) => line.includes(keyword))) {
      // Return the next few lines as summary
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
    "React Native",
    "TensorFlow",
    "PyTorch",
    "Machine Learning",
    "AI",
    "Data Science",
    "DevOps",
    "CI/CD",
    "Jenkins",
    "Linux",
    "Nginx",
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
  const experiencePatterns = [
    /(\d+)\+?\s*years?/i,
    /experience[:\s]+(\d+)/i,
    /(\d+)\s*yr/i,
  ];

  for (const pattern of experiencePatterns) {
    const match = text.match(pattern);
    if (match) {
      return parseInt(match[1]);
    }
  }
  return 0;
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
    "B.E.",
    "M.E.",
    "B.A.",
    "M.A.",
    "BBA",
    "MBA",
    "High School",
    "Associate",
    "Diploma",
    "Certificate",
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
  // Look for name at the beginning of the resume
  const lines = text.split("\n").filter((line) => line.trim().length > 0);

  // Usually the first non-empty line is the name
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    // Check if it looks like a name (not too long, no special characters)
    if (
      firstLine.length < 50 &&
      !firstLine.includes("@") &&
      !firstLine.includes("http")
    ) {
      return firstLine;
    }
  }
  return "";
}

function extractEmail(text) {
  const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z]+)/g;
  const match = text.match(emailRegex);
  return match ? match[0] : "";
}

function extractPhone(text) {
  const phoneRegex = /(\+?\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g;
  const match = text.match(phoneRegex);
  return match ? match[0] : "";
}

export default {
  parseResume,
  parseResumeLocally,
};
