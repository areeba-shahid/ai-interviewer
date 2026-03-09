import { useState, useEffect, useCallback } from "react";
import { interviewAPI } from "../services/interviewAPI";
import toast from "react-hot-toast";

export const useInterview = (interviewId) => {
  const [interview, setInterview] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timeSpent, setTimeSpent] = useState({});
  const [startTime, setStartTime] = useState(null);

  // Load interview data
  useEffect(() => {
    const loadInterview = async () => {
      try {
        setLoading(true);
        const data = await interviewAPI.getOne(interviewId);
        setInterview(data.data);

        // Initialize answers from existing data
        const initialAnswers = {};
        const initialTimeSpent = {};
        data.data.questions.forEach((q, index) => {
          if (q.answer?.text) {
            initialAnswers[index] = q.answer.text;
          }
          if (q.timeSpent) {
            initialTimeSpent[index] = q.timeSpent;
          }
        });
        setAnswers(initialAnswers);
        setTimeSpent(initialTimeSpent);
      } catch (error) {
        console.error("Failed to load interview:", error);
        toast.error("Failed to load interview");
      } finally {
        setLoading(false);
      }
    };

    if (interviewId) {
      loadInterview();
    }
  }, [interviewId]);

  // Start timer when question changes
  useEffect(() => {
    if (!loading && interview) {
      setStartTime(Date.now());
    }
  }, [currentQuestionIndex, loading, interview]);

  // Track time spent on current question
  const updateTimeSpent = useCallback(() => {
    if (startTime && interview) {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent((prev) => ({
        ...prev,
        [currentQuestionIndex]: (prev[currentQuestionIndex] || 0) + elapsed,
      }));
    }
  }, [startTime, currentQuestionIndex, interview]);

  // Move to next question
  const nextQuestion = useCallback(async () => {
    // Save current answer before moving
    if (answers[currentQuestionIndex]?.trim()) {
      await saveCurrentProgress(false);
    }

    updateTimeSpent();

    if (currentQuestionIndex < (interview?.questions?.length || 0) - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setStartTime(Date.now());
    }
  }, [currentQuestionIndex, interview, answers, updateTimeSpent]);

  // Move to previous question
  const previousQuestion = useCallback(() => {
    updateTimeSpent();
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
      setStartTime(Date.now());
    }
  }, [currentQuestionIndex, updateTimeSpent]);

  // Save current answer
  const saveAnswer = useCallback(
    (answer) => {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: answer,
      }));
    },
    [currentQuestionIndex]
  );

  // Save progress to database
  const saveCurrentProgress = useCallback(
    async (showToast = true) => {
      if (!interview) return;

      try {
        setSaving(true);

        // Prepare questions with answers
        const updatedQuestions = interview.questions.map((q, index) => ({
          ...q,
          answer: {
            ...q.answer,
            text: answers[index] || "",
          },
          timeSpent: timeSpent[index] || 0,
        }));

        await interviewAPI.update(interviewId, {
          questions: updatedQuestions,
          status: "in-progress",
        });

        if (showToast) {
          toast.success("Progress saved");
        }
      } catch (error) {
        console.error("Failed to save progress:", error);
        if (showToast) {
          toast.error("Failed to save progress");
        }
      } finally {
        setSaving(false);
      }
    },
    [interview, interviewId, answers, timeSpent]
  );

  // Submit interview
  const submitInterview = useCallback(async () => {
    try {
      setSaving(true);
      updateTimeSpent();

      const updatedQuestions = interview.questions.map((q, index) => ({
        ...q,
        answer: {
          ...q.answer,
          text: answers[index] || "",
        },
        timeSpent: timeSpent[index] || 0,
      }));

      await interviewAPI.update(interviewId, {
        questions: updatedQuestions,
        status: "completed",
        completedAt: new Date(),
      });

      toast.success("Interview completed!");
      return true;
    } catch (error) {
      console.error("Failed to submit interview:", error);
      toast.error("Failed to submit interview");
      return false;
    } finally {
      setSaving(false);
    }
  }, [interview, interviewId, answers, timeSpent, updateTimeSpent]);

  // Skip current question
  const skipQuestion = useCallback(async () => {
    const updatedQuestions = [...interview.questions];
    updatedQuestions[currentQuestionIndex] = {
      ...updatedQuestions[currentQuestionIndex],
      skipped: true,
    };

    setInterview((prev) => ({
      ...prev,
      questions: updatedQuestions,
    }));

    await nextQuestion();
  }, [currentQuestionIndex, interview, nextQuestion]);

  // Get current question
  const currentQuestion = interview?.questions?.[currentQuestionIndex] || null;

  // Calculate progress
  const progress = {
    current: currentQuestionIndex + 1,
    total: interview?.questions?.length || 0,
    percentage: interview?.questions?.length
      ? ((currentQuestionIndex + 1) / interview.questions.length) * 100
      : 0,
    answered: Object.keys(answers).filter((k) => answers[k]?.trim()).length,
  };

  return {
    interview,
    currentQuestion,
    currentQuestionIndex,
    answers,
    loading,
    saving,
    progress,
    timeSpent,
    saveAnswer,
    nextQuestion,
    previousQuestion,
    saveCurrentProgress,
    submitInterview,
    skipQuestion,
  };
};
