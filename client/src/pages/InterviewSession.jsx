import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { interviewAPI } from "../services/interviewAPI";
import { aiAPI } from "../services/aiAPI";
import {
  speak,
  listen,
  isSpeechSupported,
  initSpeech,
  unlockSpeech,
} from "../utils/speech";
import VoiceRecorder from "../components/Interview/VoiceRecorder";
import TabMonitor from "../components/Interview/TabMonitor";
import CameraMonitor from "../components/Interview/CameraMonitor";
import FullscreenMonitor from "../components/Interview/FullscreenMonitor";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import toast from "react-hot-toast";

const InterviewSession = () => {
  const { userId, interviewId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [aiState, setAiState] = useState("initializing");
  const [currentEvaluation, setCurrentEvaluation] = useState(null);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [finalResult, setFinalResult] = useState(null);
  const [cameraStream, setCameraStream] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [interviewTerminated, setInterviewTerminated] = useState(false);
  const [setupTimer, setSetupTimer] = useState(30);
  const [setupComplete, setSetupComplete] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [questionSpoken, setQuestionSpoken] = useState(false);
  const [speechReady, setSpeechReady] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false); // 🔥 NEW: Prevent double actions
  const [pendingQuestionIndex, setPendingQuestionIndex] = useState(null); // 🔥 NEW: Track pending navigation

  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const fullscreenWarningIssued = useRef(false);

  const currentQuestion = interview?.questions?.[currentQuestionIndex];
  const totalQuestions = interview?.questions?.length || 0;
  const progressPercentage =
    totalQuestions > 0
      ? ((currentQuestionIndex + 1) / totalQuestions) * 100
      : 0;

  // Initialize speech
  useEffect(() => {
    const init = async () => {
      const ready = await initSpeech();
      setSpeechReady(ready);
      if (!ready) toast.error("Speech synthesis not ready. Please refresh.");
    };
    init();
    unlockSpeech();
  }, []);

  // Load interview
  useEffect(() => {
    const loadInterview = async () => {
      try {
        setLoading(true);
        const data = await interviewAPI.getOne(interviewId);
        setInterview(data.data);
      } catch (error) {
        toast.error("Failed to load interview");
      } finally {
        setLoading(false);
      }
    };
    if (interviewId) loadInterview();
  }, [interviewId]);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: true,
        });
        setCameraStream(stream);
        setCameraActive(true);
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCameraError("Camera access required");
        toast.error("Please allow camera access");
      }
    };
    initCamera();
    return () => cameraStream?.getTracks().forEach((track) => track.stop());
  }, []);

  // Setup timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setSetupTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  // Setup complete detection
  useEffect(() => {
    if (cameraActive && fullscreen && !setupComplete && !interviewTerminated) {
      setSetupComplete(true);
      clearInterval(timerRef.current);
      toast.success("✅ Setup complete! Starting interview...");
    }
  }, [cameraActive, fullscreen, setupComplete, interviewTerminated]);

  // Setup timeout
  useEffect(() => {
    if (setupTimer === 0 && !setupComplete && !interviewTerminated) {
      if (!cameraActive || !fullscreen)
        handleTerminate("Setup timeout: Enable camera & fullscreen");
    }
  }, [
    setupTimer,
    cameraActive,
    fullscreen,
    setupComplete,
    interviewTerminated,
  ]);

  // Start interview
  useEffect(() => {
    if (
      setupComplete &&
      interview &&
      !interviewTerminated &&
      !hasStarted &&
      speechReady
    ) {
      setHasStarted(true);
      const timer = setTimeout(() => {
        startInterview();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [setupComplete, interview, interviewTerminated, hasStarted, speechReady]);

  // Fullscreen warning (throttled)
  useEffect(() => {
    if (
      setupComplete &&
      !interviewTerminated &&
      !fullscreen &&
      !fullscreenWarningIssued.current
    ) {
      speak("Warning: Please stay in fullscreen mode.");
      fullscreenWarningIssued.current = true;
    } else if (fullscreen) {
      fullscreenWarningIssued.current = false;
    }
  }, [fullscreen, setupComplete, interviewTerminated]);

  // 🔥 FIX: Ask question when index changes (with proper synchronization)
  useEffect(() => {
    if (
      !interviewTerminated &&
      setupComplete &&
      currentQuestion &&
      !questionSpoken &&
      !isProcessing &&
      hasStarted
    ) {
      // Small delay to ensure UI is ready
      const timer = setTimeout(() => {
        askCurrentQuestion();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [
    currentQuestionIndex,
    interviewTerminated,
    setupComplete,
    currentQuestion,
    questionSpoken,
    isProcessing,
    hasStarted,
  ]);

  const handleTerminate = (reason) => {
    if (!interviewTerminated) {
      setInterviewTerminated(true);
      toast.error(`❌ ${reason}`);
      speak(`Interview terminated: ${reason}`);
      cameraStream?.getTracks().forEach((track) => track.stop());
      if (document.fullscreenElement) document.exitFullscreen();
    }
  };

  const startInterview = async () => {
    setAiState("questioning");
    try {
      await speak(
        "Welcome to your AI interview. Please speak clearly. Let's begin with the first question."
      );
      // Question will be asked by the useEffect
    } catch {
      setAiState("listening");
    }
  };

  const askCurrentQuestion = async () => {
    if (
      !currentQuestion ||
      interviewTerminated ||
      questionSpoken ||
      isProcessing
    )
      return;

    setIsProcessing(true);
    setAiState("questioning");

    try {
      await speak(
        `Question ${currentQuestionIndex + 1}: ${currentQuestion.question}`
      );
      setQuestionSpoken(true);
      setAiState("listening");
    } catch (error) {
      console.error("Failed to speak question:", error);
      setQuestionSpoken(true);
      setAiState("listening");
    } finally {
      setIsProcessing(false);
    }
  };

  const saveAnswer = (text) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: text }));
  };

  const evaluateAnswer = async (answer) => {
    setAiState("evaluating");
    setIsProcessing(true);

    try {
      console.log("📤 Sending evaluation request with:", {
        question: currentQuestion.question,
        answer: answer.substring(0, 50) + "...",
        interviewId: interviewId,
        questionIndex: currentQuestionIndex,
      });

      const evaluation = await aiAPI.evaluateAnswer({
        question: currentQuestion.question,
        answer: answer,
        expectedPoints: currentQuestion.expectedPoints || [],
        interviewId: interviewId, // ← MUST be included
        questionIndex: currentQuestionIndex, // ← MUST be included
      });

      console.log(`✅ Got evaluation with score: ${evaluation.data.score}`);

      setCurrentEvaluation(evaluation.data);

      // Update local state
      const updatedQuestions = [...interview.questions];
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        answer: { text: answer },
        feedback: {
          score: evaluation.data.score,
          strengths: evaluation.data.feedback?.strengths || [],
          improvements: evaluation.data.feedback?.improvements || [],
          summary: evaluation.data.feedback?.summary || "",
          evaluatedAt: new Date(),
        },
      };

      setInterview((prev) => ({
        ...prev,
        questions: updatedQuestions,
      }));

      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: answer,
      }));

      const score = evaluation.data.score;
      const feedbackText = `Score ${score}/10. ${
        evaluation.data.feedback?.summary || ""
      }`;
      await speak(feedbackText);
      setAiState("feedback");
    } catch (error) {
      console.error(`❌ Evaluation failed:`, error);
      if (error.status === 400) {
        toast.error("Missing required fields. Please try again.");
      } else if (error.status === 429) {
        toast.error("AI service quota exceeded. Please try later.");
      } else {
        toast.error("Failed to evaluate answer");
      }
      await speak("Could not evaluate answer.");
      setAiState("feedback");
    } finally {
      setIsProcessing(false);
    }
  };
  // Next question handler
  const handleNext = async () => {
    if (interviewTerminated || isProcessing) return;

    // Don't allow next while listening or evaluating
    if (aiState === "listening" || aiState === "evaluating") {
      toast.error("Please wait for current question to complete");
      return;
    }

    if (currentQuestionIndex === totalQuestions - 1) {
      await completeInterview();
      return;
    }

    // Move to next question
    setQuestionSpoken(false);
    setCurrentEvaluation(null);
    setCurrentQuestionIndex((prev) => prev + 1);
  };

  const handleSkip = async () => {
    if (interviewTerminated || isProcessing) return;

    setIsProcessing(true);
    try {
      await speak("Question skipped. Moving to next question.");

      if (currentQuestionIndex === totalQuestions - 1) {
        await completeInterview();
      } else {
        setQuestionSpoken(false);
        setCurrentEvaluation(null);
        setCurrentQuestionIndex((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Skip failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const completeInterview = async () => {
    setAiState("evaluating");
    setIsProcessing(true);

    try {
      // Get final evaluation from AI (this already calculates everything)
      const result = await aiAPI.evaluateInterview(interviewId);

      // Fetch the latest interview data for question details
      const updatedInterview = await interviewAPI.getOne(interviewId);
      const interviewData = updatedInterview.data;

      // Prepare detailed results for display
      const questionResults = interviewData.questions.map((q, index) => ({
        number: index + 1,
        question: q.question.substring(0, 60) + "...",
        score: q.feedback?.score || 0,
        feedback: q.feedback?.summary || "Not evaluated",
      }));

      // Use the score from backend (already calculated)
      const averageScore = parseFloat(result.data.overallScore).toFixed(1);
      const passed = averageScore >= 7;

      // Combine results
      const finalResults = {
        overallScore: averageScore,
        totalQuestions: interviewData.questions.length,
        answeredQuestions: interviewData.questions.filter(
          (q) => q.feedback?.score
        ).length,
        strengths: result.data.strengths || [],
        improvements: result.data.improvements || [],
        feedback: result.data.feedback || "Interview completed.",
        questionResults,
        passed,
      };

      setFinalResult(finalResults);

      const resultText = passed
        ? `Interview complete! You scored ${averageScore} out of 10. You passed!`
        : `Interview complete. You scored ${averageScore} out of 10. Keep practicing.`;

      await speak(resultText);
      await interviewAPI.update(interviewId, { status: "completed" });
      setInterviewComplete(true);
    } catch (error) {
      console.error("❌ Final evaluation failed:", error);
      toast.error("Failed to complete interview");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );

  if (!interview)
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <Card className="p-8">
          <h2 className="text-2xl font-bold mb-4">Interview Not Found</h2>
          <Button onClick={() => navigate(`/user/${userId}/interviews`)}>
            Back
          </Button>
        </Card>
      </div>
    );

  if (interviewTerminated)
    return (
      <div className="max-w-4xl mx-auto py-8 text-center">
        <Card className="p-8 bg-red-50">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            Interview Terminated
          </h1>
          <Button onClick={() => navigate(`/user/${userId}/dashboard`)}>
            Dashboard
          </Button>
        </Card>
      </div>
    );

  {
    if (interviewComplete && finalResult) {
      return (
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Card className="p-8">
            {/* Header - Removed pass/fail emoji logic */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">📊</div>
              <h1 className="text-3xl font-bold mb-2">Interview Complete</h1>
              <p className="text-gray-600">Here's your performance summary</p>
            </div>

            {/* Overall Score */}
            <div className="text-center mb-8">
              <div className="text-6xl font-bold text-blue-600 mb-2">
                {finalResult.overallScore}/10
              </div>
              <p className="text-gray-600">Overall Score</p>
            </div>

            {/* Question Breakdown */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Question Breakdown</h2>
              <div className="space-y-3">
                {interview.questions.map((q, i) => (
                  <div key={i} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium">Q{i + 1}:</span>
                      <span
                        className={`font-bold ${
                          q.feedback?.score >= 7
                            ? "text-green-600"
                            : q.feedback?.score >= 4
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {q.feedback?.score || 0}/10
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {q.question.substring(0, 60)}...
                    </p>
                    {q.feedback?.summary && (
                      <p className="text-xs text-gray-500 mt-1">
                        💬 {q.feedback.summary}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-green-50">
                <h3 className="font-semibold mb-3 text-green-700">
                  ✅ Strengths
                </h3>
                <ul className="space-y-2">
                  {finalResult.strengths?.length > 0 ? (
                    finalResult.strengths.map((s, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        • {s}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">
                      No strengths recorded
                    </li>
                  )}
                </ul>
              </Card>
              <Card className="bg-yellow-50">
                <h3 className="font-semibold mb-3 text-yellow-700">
                  📝 To Improve
                </h3>
                <ul className="space-y-2">
                  {finalResult.improvements?.length > 0 ? (
                    finalResult.improvements.map((s, i) => (
                      <li key={i} className="text-sm text-gray-700">
                        • {s}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">No suggestions</li>
                  )}
                </ul>
              </Card>
            </div>

            {/* Final Feedback */}
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">{finalResult.feedback}</p>
            </div>

            {/* Action Button */}
            <Button
              onClick={() => navigate(`/user/${userId}/dashboard`)}
              className="w-full"
            >
              Go to Dashboard
            </Button>
          </Card>
        </div>
      );
    }
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Setup Progress Bar */}
      {!setupComplete && (
        <Card className="mb-6 p-4 bg-yellow-50 border-yellow-200">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-yellow-800">
              ⏳ Setting up your interview
            </h3>
            <span className="text-xl font-bold text-yellow-800">
              {setupTimer}s
            </span>
          </div>
          <div className="w-full h-2 bg-yellow-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 transition-all duration-1000"
              style={{ width: `${(setupTimer / 30) * 100}%` }}
            />
          </div>
          <p className="text-sm text-yellow-700 mt-2">
            Please enable camera and enter fullscreen mode within {setupTimer}{" "}
            seconds
          </p>
          <div className="grid grid-cols-2 gap-4 mt-3">
            <div className="flex items-center gap-2">
              <span
                className={cameraActive ? "text-green-600" : "text-red-600"}
              >
                {cameraActive ? "✅ Camera OK" : "❌ Camera Required"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className={fullscreen ? "text-green-600" : "text-red-600"}>
                {fullscreen ? "✅ Fullscreen OK" : "❌ Fullscreen Required"}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* Security Monitor Bar */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <CameraMonitor
          onStatusChange={setCameraActive}
          onTerminate={handleTerminate}
        />
        <FullscreenMonitor
          onFullscreenChange={setFullscreen}
          onTerminate={handleTerminate}
        />
        <TabMonitor onTerminate={handleTerminate} />
      </div>

      {/* Main Interview Area */}
      {setupComplete ? (
        <Card className="p-8">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          {/* Question */}

          <div className="mb-4 p-4 bg-blue-100 rounded-lg">
            <Button
              onClick={async () => {
                try {
                  const response = await fetch(
                    "http://localhost:5000/api/ai/test",
                    {
                      headers: {
                        Authorization: `Bearer ${await user?.getIdToken()}`,
                      },
                    }
                  );
                  const data = await response.json();
                  console.log("Test response:", data);
                  toast.success("AI routes are working!");
                } catch (error) {
                  console.error("Test failed:", error);
                  toast.error("AI routes not working");
                }
              }}
              variant="primary"
              size="sm"
            >
              Press stop button after you completed your answer
            </Button>
          </div>
          <div className="mb-8">
            <span className="text-sm text-gray-500 mb-2 block">
              Question {currentQuestionIndex + 1}
            </span>
            <h2 className="text-2xl font-bold mb-4">
              {currentQuestion?.question}
            </h2>
            <div className="flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {currentQuestion?.difficulty}
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {currentQuestion?.type}
              </span>
            </div>
          </div>
          {/* Voice Controls */}
          <div className="space-y-6">
            <VoiceRecorder
              onTranscription={(text) => {
                saveAnswer(text);
                evaluateAnswer(text);
              }}
              disabled={
                aiState !== "listening" || interviewTerminated || isProcessing
              }
              isListening={aiState === "listening"}
            />

            {aiState === "evaluating" && (
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="animate-spin inline-block text-2xl mr-2">
                  🤔
                </div>
                <p className="text-lg font-medium inline">
                  Evaluating your answer...
                </p>
              </div>
            )}

            {currentEvaluation && (
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold mb-2">AI Feedback</h3>
                <p className="text-gray-700">
                  {currentEvaluation.feedback?.summary}
                </p>
                <p className="mt-2 text-lg font-bold text-blue-600">
                  Score: {currentEvaluation.score}/10
                </p>
                {currentEvaluation.feedback?.strengths?.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium text-green-700">
                      Strengths:
                    </p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {currentEvaluation.feedback.strengths.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {answers[currentQuestionIndex] && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium mb-2">Your Answer:</p>
                <p className="text-gray-700">{answers[currentQuestionIndex]}</p>
              </div>
            )}

            <div className="flex justify-between gap-4 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleSkip}
                disabled={
                  aiState === "listening" ||
                  aiState === "evaluating" ||
                  interviewTerminated ||
                  isProcessing
                }
              >
                Skip Question
              </Button>
              <Button
                onClick={handleNext}
                disabled={
                  aiState === "listening" ||
                  aiState === "evaluating" ||
                  interviewTerminated ||
                  isProcessing
                }
              >
                {currentQuestionIndex === totalQuestions - 1
                  ? "Complete Interview"
                  : "Next Question"}
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4 animate-pulse">🎥</div>
          <h2 className="text-2xl font-bold mb-4">Preparing Your Interview</h2>
          <p className="text-gray-600 mb-6">
            Please enable your camera and enter fullscreen mode to continue.
          </p>
          <div className="space-y-4 max-w-md mx-auto">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Camera Access</span>
              {cameraActive ? (
                <span className="text-green-600 font-bold">✅ Enabled</span>
              ) : (
                <span className="text-yellow-600">Waiting...</span>
              )}
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span>Fullscreen Mode</span>
              {fullscreen ? (
                <span className="text-green-600 font-bold">✅ Active</span>
              ) : (
                <span className="text-yellow-600">
                  Press F11 or click the fullscreen button above
                </span>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default InterviewSession;
