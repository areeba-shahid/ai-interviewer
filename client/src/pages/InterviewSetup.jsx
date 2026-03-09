import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUserData } from "../hooks/useUserData";
import { interviewAPI } from "../services/interviewAPI";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import CreatableSelect from "react-select/creatable";
import toast from "react-hot-toast";
import { aiAPI } from "../services/aiAPI"; // Make sure to import this
const InterviewSetup = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = useUserData();

  const [loading, setLoading] = useState(false);
  const [techOptions, setTechOptions] = useState([]);
  const [config, setConfig] = useState({
    role: "",
    experience: "mid",
    techStack: [],
    interviewType: "mixed",
    difficulty: "medium",
    numQuestions: 5,
    focusAreas: [],
    excludedTopics: [],
  });

  // Load user data from profile and settings
  useEffect(() => {
    if (profile) {
      console.log("📂 Loading user data for interview setup:");

      // Pre-fill from user profile
      setConfig({
        role: profile.profession || "",
        experience: profile.experience || "mid",
        techStack:
          profile.technicalSkills ||
          profile.skills?.filter(
            (s) => !["Communication", "Teamwork", "Leadership"].includes(s)
          ) ||
          [],
        interviewType: "mixed",
        difficulty: profile.preferences?.defaultDifficulty || "medium",
        numQuestions: profile.preferences?.defaultQuestions || 5,
        focusAreas: [],
        excludedTopics: [],
      });

      // Prepare tech options from user's skills
      const skills = profile.technicalSkills || profile.skills || [];
      setTechOptions(skills.map((skill) => ({ value: skill, label: skill })));
    }
  }, [profile]);

  const handleChange = (field, value) => {
    setConfig((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddTech = (newTech) => {
    const techValue = typeof newTech === "string" ? newTech : newTech.value;
    if (!config.techStack.includes(techValue)) {
      setConfig((prev) => ({
        ...prev,
        techStack: [...prev.techStack, techValue],
      }));
    }
  };

  const handleRemoveTech = (techToRemove) => {
    setConfig((prev) => ({
      ...prev,
      techStack: prev.techStack.filter((t) => t !== techToRemove),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!config.role.trim()) {
      toast.error("Please enter a job role");
      return;
    }

    if (config.techStack.length === 0) {
      toast.error("Please select at least one technology");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Create interview document
      const interviewData = {
        config: {
          role: config.role,
          experience: config.experience,
          techStack: config.techStack,
          interviewType: config.interviewType,
          difficulty: config.difficulty,
          numQuestions: config.numQuestions,
          focusAreas: config.focusAreas,
          excludedTopics: config.excludedTopics,
        },
        status: "pending",
        questions: [], // Initialize empty
      };

      console.log("📤 Creating interview with config:", interviewData);
      const createResponse = await interviewAPI.create(interviewData);
      const interviewId = createResponse.data._id;

      toast.success("Interview created! Generating questions...");

      // Step 2: Generate questions using AI
      console.log("🤖 Calling AI to generate questions...");
      try {
        const questionsResponse = await aiAPI.generateQuestions({
          config: interviewData.config,
        });

        console.log("✅ Questions generated:", questionsResponse);

        if (!questionsResponse.data || !questionsResponse.data.questions) {
          throw new Error("No questions in response");
        }

        // Step 3: Update interview with generated questions
        await interviewAPI.update(interviewId, {
          questions: questionsResponse.data.questions,
        });

        toast.success(
          `${questionsResponse.data.questions.length} questions generated!`
        );

        // Step 4: Navigate to interview session
        navigate(`/user/${userId}/interviews/${interviewId}`);
      } catch (aiError) {
        console.error("❌ AI generation failed:", aiError);
        toast.error("Failed to generate questions. Please try again.");

        // Option: Use mock questions as fallback
        const useMock = window.confirm(
          "AI generation failed. Use sample questions instead?"
        );
        if (useMock) {
          const mockQuestions = generateMockQuestions(interviewData.config);
          await interviewAPI.update(interviewId, {
            questions: mockQuestions,
          });
          toast.success("Sample questions generated!");
          navigate(`/user/${userId}/interviews/${interviewId}`);
        } else {
          // Delete the empty interview
          await interviewAPI.delete(interviewId);
        }
      }
    } catch (error) {
      console.error("❌ Failed to create interview:", error);
      toast.error("Failed to create interview");
    } finally {
      setLoading(false);
    }
  };

  // Fallback mock questions generator
  const generateMockQuestions = (config) => {
    const questions = [];
    const { techStack, numQuestions, difficulty, interviewType } = config;

    const technicalQuestions = [
      `Explain how you would implement a responsive layout using ${
        techStack[0] || "React"
      }.`,
      `What are the key differences between ${techStack
        .slice(0, 2)
        .join(" and ")}?`,
      `Describe a challenging bug you fixed in a ${
        techStack[0] || "web"
      } application.`,
      `How do you optimize performance in a ${
        techStack[0] || "React"
      } application?`,
      `Explain the concept of state management in ${techStack[0] || "React"}.`,
    ];

    const behavioralQuestions = [
      "Tell me about a time you had to work under pressure.",
      "How do you handle disagreements with team members?",
      "Describe a project you're proud of.",
      "How do you stay updated with new technologies?",
      "Tell me about a time you failed and what you learned.",
    ];

    for (let i = 0; i < numQuestions; i++) {
      const isTechnical =
        interviewType === "mixed" ? i % 2 === 0 : interviewType === "technical";

      questions.push({
        question: isTechnical
          ? technicalQuestions[i % technicalQuestions.length]
          : behavioralQuestions[i % behavioralQuestions.length],
        type: isTechnical ? "technical" : "behavioral",
        category: isTechnical ? techStack[i % techStack.length] : "behavioral",
        difficulty: difficulty,
        expectedPoints: [],
        sampleAnswer: "",
      });
    }

    return questions;
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Setup Your Interview</h1>
      <p className="text-gray-600 mb-8">
        Customize your interview settings. Changes here won't affect your
        profile settings.
      </p>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
            Basic Information
          </h2>

          <div className="space-y-6">
            {/* Job Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job Role <span className="text-red-500">*</span>
              </label>
              <Input
                value={config.role}
                onChange={(e) => handleChange("role", e.target.value)}
                placeholder="e.g., Frontend Developer, Full Stack Engineer"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Pre-filled from your profile, but you can edit it
              </p>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                value={config.experience}
                onChange={(e) => handleChange("experience", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="entry">Entry Level (0-2 years)</option>
                <option value="junior">Junior (2-3 years)</option>
                <option value="mid">Mid-Level (3-5 years)</option>
                <option value="senior">Senior (5-8 years)</option>
                <option value="lead">Lead (8+ years)</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Technologies */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
            Technologies & Skills
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Technologies <span className="text-red-500">*</span>
            </label>
            <CreatableSelect
              isMulti
              options={techOptions}
              value={config.techStack.map((t) => ({ value: t, label: t }))}
              onChange={(newValue) => {
                handleChange(
                  "techStack",
                  newValue.map((v) => v.value)
                );
              }}
              onCreateOption={handleAddTech}
              placeholder="Type or select technologies..."
              className="react-select mb-3"
              classNamePrefix="select"
            />

            {/* Selected technologies as tags */}
            <div className="mt-3 flex flex-wrap gap-2">
              {config.techStack.map((tech) => (
                <span
                  key={tech}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                >
                  {tech}
                  <button
                    type="button"
                    onClick={() => handleRemoveTech(tech)}
                    className="ml-1 text-blue-700 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Pre-filled from your skills. Add or remove as needed.
            </p>
          </div>
        </Card>

        {/* Interview Configuration */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
            Interview Configuration
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Interview Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Type
              </label>
              <select
                value={config.interviewType}
                onChange={(e) => handleChange("interviewType", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="technical">Technical Only</option>
                <option value="behavioral">Behavioral Only</option>
                <option value="mixed">Mixed (Technical + Behavioral)</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level
              </label>
              <select
                value={config.difficulty}
                onChange={(e) => handleChange("difficulty", e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            {/* Number of Questions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Questions
              </label>
              <input
                type="range"
                min="3"
                max="15"
                value={config.numQuestions}
                onChange={(e) =>
                  handleChange("numQuestions", parseInt(e.target.value))
                }
                className="w-full"
              />
              <div className="text-center mt-2 font-semibold">
                {config.numQuestions} questions
              </div>
            </div>
          </div>
        </Card>

        {/* Focus Areas (Optional) */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
            Focus Areas (Optional)
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics to Focus On
              </label>
              <CreatableSelect
                isMulti
                value={config.focusAreas.map((a) => ({ value: a, label: a }))}
                onChange={(newValue) => {
                  handleChange(
                    "focusAreas",
                    newValue.map((v) => v.value)
                  );
                }}
                placeholder="e.g., React Hooks, System Design, Algorithms..."
                className="react-select"
                classNamePrefix="select"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics to Exclude
              </label>
              <CreatableSelect
                isMulti
                value={config.excludedTopics.map((a) => ({
                  value: a,
                  label: a,
                }))}
                onChange={(newValue) => {
                  handleChange(
                    "excludedTopics",
                    newValue.map((v) => v.value)
                  );
                }}
                placeholder="e.g., Legacy code, Specific algorithms..."
                className="react-select"
                classNamePrefix="select"
              />
            </div>
          </div>
        </Card>

        {/* Summary */}
        <Card className="p-6 mb-6 bg-blue-50">
          <h3 className="font-semibold mb-2">Interview Summary</h3>
          <p className="text-gray-700">
            You're setting up a{" "}
            <span className="font-semibold">{config.difficulty}</span> level{" "}
            <span className="font-semibold">{config.interviewType}</span>{" "}
            interview for a <span className="font-semibold">{config.role}</span>{" "}
            position.
          </p>
          <p className="text-gray-700 mt-1">
            Technologies: {config.techStack.join(", ") || "None selected"}
          </p>
          {config.focusAreas.length > 0 && (
            <p className="text-gray-700 mt-1">
              Focus areas: {config.focusAreas.join(", ")}
            </p>
          )}
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/user/${userId}/dashboard`)}
          >
            Cancel
          </Button>
          <Button type="submit" isLoading={loading}>
            Generate Interview Questions
          </Button>
        </div>
      </form>
    </div>
  );
};

export default InterviewSetup;
