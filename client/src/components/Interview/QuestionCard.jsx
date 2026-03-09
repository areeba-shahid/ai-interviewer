import React, { useState, useEffect } from "react";
import Card from "../UI/Card";
import Button from "../UI/Button";

const QuestionCard = ({
  question,
  index,
  total,
  answer,
  onAnswerChange,
  onSave,
  onNext,
  onPrevious,
  onSkip,
  isSaving,
  timeSpent,
}) => {
  const [localAnswer, setLocalAnswer] = useState(answer || "");
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    setLocalAnswer(answer || "");
  }, [answer, question]);

  const handleAnswerChange = (e) => {
    setLocalAnswer(e.target.value);
    onAnswerChange(e.target.value);
  };

  const handleSave = () => {
    onSave(localAnswer);
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case "easy":
        return "text-green-600 bg-green-50";
      case "medium":
        return "text-yellow-600 bg-yellow-50";
      case "hard":
        return "text-red-600 bg-red-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (!question) return null;

  return (
    <Card className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b">
        <div>
          <span className="text-sm text-gray-500">
            Question {index + 1} of {total}
          </span>
          <h3 className="text-xl font-semibold mt-1">{question.question}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
              question.difficulty
            )}`}
          >
            {question.difficulty}
          </span>
          {timeSpent > 0 && (
            <span className="text-sm text-gray-500">
              Time: {formatTime(timeSpent)}
            </span>
          )}
        </div>
      </div>

      {/* Question Type */}
      <div className="mb-4">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
          {question.type}
        </span>
        {question.category && (
          <span className="ml-2 inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
            {question.category}
          </span>
        )}
      </div>

      {/* Answer Area */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Answer
        </label>
        <textarea
          value={localAnswer}
          onChange={handleAnswerChange}
          rows="8"
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          placeholder="Type your answer here..."
        />
      </div>

      {/* Voice Recording (Future Feature) */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Voice Recording</p>
            <p className="text-sm text-gray-500">
              Coming soon: Record your answers with voice
            </p>
          </div>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed"
          >
            🎤 Record
          </button>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPrevious} disabled={index === 0}>
            Previous
          </Button>
          <Button variant="outline" onClick={onSkip}>
            Skip
          </Button>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleSave} isLoading={isSaving}>
            Save Progress
          </Button>
          {index === total - 1 ? (
            <Button onClick={onNext}>Submit Interview</Button>
          ) : (
            <Button onClick={onNext}>Next Question</Button>
          )}
        </div>
      </div>
    </Card>
  );
};

export default QuestionCard;
