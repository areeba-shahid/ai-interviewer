import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useInterview } from "../hooks/useInterview";
import { aiAPI } from "../services/aiAPI";
import VoiceRecorder from "../components/Interview/VoiceRecorder";
import CameraMonitor from "../components/Interview/CameraMonitor";
import TabMonitor from "../components/Interview/TabMonitor";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import toast from "react-hot-toast";
import { speak, isSpeechSupported } from "../../utils/speech";

const AdvancedInterviewSession = () => {
  const { userId, interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [aiState, setAiState] = useState("idle"); // idle, generating, questioning, evaluating
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [finalScore, setFinalScore] = useState(null);

  const {
    interview,
    currentQuestion,
    currentQuestionIndex,
    answers,
    loading,
    saving,
    progress,
    saveAnswer,
    nextQuestion,
    submitInterview,
  } = useInterview(interviewId);

  // Anti-cheating limits
  const MAX_TAB_SWITCHES = 3;
  const REQUIRED_CAMERA = true;
  const REQUIRED_MIC = true;

  // Handle tab switching
  const handleTabSwitch = () => {
    setTabSwitches((prev) => {
      const newCount = prev + 1;
      if (newCount >= MAX_TAB_SWITCHES) {
        toast.error("Interview terminated due to multiple tab switches");
        submitInterview(true); // Force submit
        navigate(
          `/user/${userId}/interviews/${interviewId}/results?terminated=true`
        );
      } else {
        toast.warning(
          `Warning: Tab switch detected (${newCount}/${MAX_TAB_SWITCHES})`
        );
      }
      return newCount;
    });
  };

  // Handle camera status
  const handleCameraStatus = (active) => {
    setCameraActive(active);
    if (!active && REQUIRED_CAMERA) {
      toast.error("Camera required for interview");
    }
  };

  // Handle mic status
  const handleMicStatus = (active) => {
    setMicActive(active);
    if (!active && REQUIRED_MIC) {
      toast.error("Microphone required for interview");
    }
  };

  // Generate AI feedback for current answer
  const evaluateCurrentAnswer = async () => {
    if (!answers[currentQuestionIndex]?.trim()) {
      toast.error("Please provide an answer first");
      return;
    }

    setAiState("evaluating");
    try {
      const evaluation = await aiAPI.evaluateAnswer({
        question: currentQuestion.question,
        answer: answers[currentQuestionIndex],
        expectedPoints: currentQuestion.expectedPoints || [],
      });

      setCurrentEvaluation(evaluation.data);

      // Speak the feedback (text-to-speech)
      if (isSpeechSupported()) {
        speak(
          `Your answer scored ${evaluation.data.score} out of 10. ${evaluation.data.feedback.summary}`,
          { rate: 0.9 }
        );
      }
    } catch (error) {
      console.error("Evaluation failed:", error);
      toast.error("Failed to evaluate answer");
    } finally {
      setAiState("questioning");
    }
  };

  // Generate next question (with potential follow-up)
  const handleNextWithAI = async () => {
    if (currentQuestionIndex === progress.total - 1) {
      // Interview complete - get final evaluation
      await handleCompleteInterview();
    } else {
      // Check if we should generate a follow-up
      if (currentEvaluation && currentEvaluation.score >= 8) {
        // Good answer - try to generate follow-up
        setAiState("generating");
        try {
          const followUp = await aiAPI.generateFollowUp({
            conversation: interview.questions.slice(
              0,
              currentQuestionIndex + 1
            ),
            question: currentQuestion.question,
            answer: answers[currentQuestionIndex],
          });

          if (followUp.data?.question) {
            // Insert follow-up question
            // This would require modifying the interview structure
            toast.info("Follow-up question coming...");
          }
        } catch (error) {
          console.error("Follow-up failed:", error);
        }
      }

      await nextQuestion();
      setCurrentEvaluation(null);
      setAiState("questioning");
    }
  };

  // Complete interview and get final score
  const handleCompleteInterview = async () => {
    setAiState("evaluating");
    try {
      const result = await aiAPI.evaluateInterview(interviewId);
      setFinalScore(result.data);
      setInterviewComplete(true);

      // Speak final result
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(
          `Interview complete. Your overall score is ${result.data.overallScore} out of 10. ${result.data.feedback}`
        );
        window.speechSynthesis.speak(utterance);
      }

      // Submit the interview
      await submitInterview();
    } catch (error) {
      console.error("Final evaluation failed:", error);
      toast.error("Failed to complete interview");
    } finally {
      setAiState("idle");
    }
  };

  useEffect(() => {
    if (currentQuestion && aiState === "questioning" && isSpeechSupported()) {
      speak(currentQuestion.question, { rate: 0.9 });
    }
  }, [currentQuestion, aiState]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (interviewComplete && finalScore) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Card className="p-8 text-center">
          <div className="text-6xl mb-4">{finalScore.passed ? "🎉" : "📚"}</div>
          <h1 className="text-3xl font-bold mb-4">
            {finalScore.passed ? "Congratulations!" : "Keep Practicing!"}
          </h1>

          <div className="mb-6">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {finalScore.overallScore}/10
            </div>
            <p className="text-gray-600">{finalScore.feedback}</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card className="bg-green-50">
              <h3 className="font-semibold mb-2">Strengths</h3>
              <ul className="text-sm text-gray-700">
                {finalScore.strengths.slice(0, 3).map((s, i) => (
                  <li key={i} className="mb-1">
                    ✓ {s}
                  </li>
                ))}
              </ul>
            </Card>
            <Card className="bg-yellow-50">
              <h3 className="font-semibold mb-2">To Improve</h3>
              <ul className="text-sm text-gray-700">
                {finalScore.improvements.slice(0, 3).map((s, i) => (
                  <li key={i} className="mb-1">
                    → {s}
                  </li>
                ))}
              </ul>
            </Card>
          </div>

          <Button onClick={() => navigate(`/user/${userId}/dashboard`)}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  // Check if requirements are met
  const canProceed =
    cameraActive && micActive && tabSwitches < MAX_TAB_SWITCHES;

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Monitoring Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <CameraMonitor onStatusChange={handleCameraStatus} />
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-2">Microphone</h3>
          <div
            className={`text-sm ${
              micActive ? "text-green-600" : "text-red-600"
            }`}
          >
            {micActive ? "✅ Active" : "❌ Inactive"}
          </div>
        </div>
        <TabMonitor
          onTabSwitch={handleTabSwitch}
          maxSwitches={MAX_TAB_SWITCHES}
        />
      </div>

      {/* Warning if requirements not met */}
      {!canProceed && (
        <Card className="mb-6 bg-red-50 border-red-200">
          <p className="text-red-600">
            {!cameraActive && "Camera required. "}
            {!micActive && "Microphone required. "}
            {tabSwitches >= MAX_TAB_SWITCHES &&
              "Too many tab switches. Interview terminated."}
          </p>
        </Card>
      )}

      {/* Main Interview Area */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Question Area */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <div className="mb-4">
              <span className="text-sm text-gray-500">
                Question {currentQuestionIndex + 1} of {progress.total}
              </span>
              <h2 className="text-2xl font-bold mt-2">
                {currentQuestion?.question}
              </h2>
            </div>

            {/* Voice Recorder */}
            <VoiceRecorder
              onTranscription={(text) => saveAnswer(text)}
              disabled={!canProceed || aiState === "evaluating"}
            />

            {/* Answer Display */}
            {answers[currentQuestionIndex] && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium mb-2">Your Answer:</p>
                <p className="text-gray-700">{answers[currentQuestionIndex]}</p>
              </div>
            )}

            {/* AI Feedback */}
            {currentEvaluation && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">AI Feedback</span>
                  <span className="text-lg font-bold text-blue-600">
                    Score: {currentEvaluation.score}/10
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {currentEvaluation.feedback.summary}
                </p>
                {currentEvaluation.feedback.strengths.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-600">
                      Strengths:
                    </p>
                    <ul className="text-sm text-gray-600 list-disc pl-4">
                      {currentEvaluation.feedback.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Controls */}

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                onClick={evaluateCurrentAnswer}
                disabled={
                  !answers[currentQuestionIndex] || aiState === "evaluating"
                }
              >
                {aiState === "evaluating" ? "Evaluating..." : "Get AI Feedback"}
              </Button>

              <Button
                onClick={handleNextWithAI}
                disabled={!canProceed || aiState === "evaluating"}
              >
                {currentQuestionIndex === progress.total - 1
                  ? "Complete Interview"
                  : "Next Question"}
              </Button>
            </div>
          </Card>
        </div>

        {/* Progress Sidebar */}
        <div className="md:col-span-1">
          <Card className="p-4">
            <h3 className="font-semibold mb-4">Progress</h3>
            <div className="space-y-4">
              {interview?.questions?.map((q, index) => (
                <div
                  key={index}
                  className={`p-2 rounded-lg ${
                    index === currentQuestionIndex
                      ? "bg-blue-100 border-2 border-blue-600"
                      : answers[index]
                      ? "bg-green-50"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Q{index + 1}</span>
                    {answers[index] && (
                      <span className="text-xs text-green-600">✓</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 truncate">
                    {q.question.substring(0, 30)}...
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdvancedInterviewSession;
