import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { interviewAPI } from "../services/interviewAPI";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import toast from "react-hot-toast";

const Statistics = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    totalQuestions: 0,
    averageScore: 0,
    bestScore: 0,
    worstScore: 0,
    passRate: 0,
    passedInterviews: 0,
    totalTime: 0,
    strengths: [],
    improvements: [],
  });

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const response = await interviewAPI.getAll();

      let allInterviews = [];
      if (response.data && Array.isArray(response.data)) {
        allInterviews = response.data;
      }

      // Fetch full details for each interview
      const fullInterviews = [];
      for (const interview of allInterviews) {
        try {
          const fullDetails = await interviewAPI.getOne(interview._id);
          if (fullDetails.data) {
            fullInterviews.push(fullDetails.data);
          }
        } catch (err) {
          console.error(`❌ Failed to load details for ${interview._id}:`, err);
        }
      }

      setInterviews(fullInterviews);
      calculateStats(fullInterviews);
    } catch (error) {
      console.error("❌ Failed to load interviews:", error);
      toast.error("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (interviews) => {
    if (!interviews || interviews.length === 0) return;

    const totalInterviews = interviews.length;
    let totalAnsweredQuestions = 0;
    let totalScore = 0;
    let bestScore = 0;
    let worstScore = 10;
    let passedCount = 0;
    let totalTime = 0;

    const allStrengths = [];
    const allImprovements = [];

    interviews.forEach((interview) => {
      const questions = interview.questions || [];
      const answeredQuestions = questions.filter((q) => q.answer?.text);

      totalAnsweredQuestions += answeredQuestions.length;

      const interviewScore = answeredQuestions.reduce(
        (sum, q) => sum + (q.feedback?.score || 0),
        0
      );

      const interviewAvg =
        answeredQuestions.length > 0
          ? interviewScore / answeredQuestions.length
          : 0;

      totalScore += interviewScore;

      if (interviewAvg > bestScore) bestScore = interviewAvg;
      if (interviewAvg < worstScore && interviewAvg > 0)
        worstScore = interviewAvg;

      // 🔥 PASS RATE (threshold = 7)
      if (interviewAvg >= 7) passedCount++;

      totalTime += interview.stats?.totalTime || 0;

      questions.forEach((q) => {
        if (q.feedback) {
          allStrengths.push(...(q.feedback.strengths || []));
          allImprovements.push(...(q.feedback.improvements || []));
        }
      });
    });

    const averageScore =
      totalAnsweredQuestions > 0
        ? (totalScore / totalAnsweredQuestions).toFixed(1)
        : 0;

    // Count frequencies
    const strengthCount = {};
    const improvementCount = {};

    allStrengths.forEach(
      (s) => (strengthCount[s] = (strengthCount[s] || 0) + 1)
    );
    allImprovements.forEach(
      (i) => (improvementCount[i] = (improvementCount[i] || 0) + 1)
    );

    const topStrengths = Object.entries(strengthCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    const topImprovements = Object.entries(improvementCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    setStats({
      totalInterviews,
      totalQuestions: totalAnsweredQuestions,
      averageScore,
      bestScore: bestScore.toFixed(1),
      worstScore: worstScore === 10 ? "N/A" : worstScore.toFixed(1),
      passRate: ((passedCount / totalInterviews) * 100).toFixed(1),
      passedInterviews: passedCount,
      totalTime: formatTime(totalTime),
      strengths: topStrengths,
      improvements: topImprovements,
    });
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 7) return "text-green-600";
    if (numScore >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Your Statistics</h1>
        <p className="text-gray-600">
          Track your progress and improve your interview skills
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {stats.totalInterviews}
          </div>
          <p className="text-gray-600">Total Interviews</p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {stats.totalQuestions}
          </div>
          <p className="text-gray-600">Questions Answered</p>
        </Card>

        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div
            className={`text-3xl font-bold ${getScoreColor(
              stats.averageScore
            )} mb-2`}
          >
            {stats.averageScore}/10
          </div>
          <p className="text-gray-600">Average Score</p>
        </Card>

        {/* 🔥 UPDATED PASS RATE CARD */}
        <Card className="p-6 text-center hover:shadow-lg transition-shadow">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {stats.passRate}%
          </div>
          <p className="text-gray-600">Pass Rate (≥7/10)</p>
          <p className="text-xs text-gray-500 mt-1">
            {stats.passedInterviews} of {stats.totalInterviews} interviews
            passed
          </p>
        </Card>
      </div>

      {/* Score Range Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Best Performance</h3>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold text-green-600">
              {stats.bestScore}/10
            </span>
            <span className="text-gray-500">Highest score achieved</span>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Areas to Improve</h3>
          <div className="flex items-center justify-between">
            <span className="text-4xl font-bold text-yellow-600">
              {stats.worstScore}/10
            </span>
            <span className="text-gray-500">Lowest score</span>
          </div>
        </Card>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-700">
            ✅ Your Strengths
          </h3>
          <div className="space-y-3">
            {stats.strengths.length > 0 ? (
              stats.strengths.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-green-50 rounded"
                >
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-500">
                    mentioned {item.count}x
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No strengths recorded yet
              </p>
            )}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-700">
            📝 To Improve
          </h3>
          <div className="space-y-3">
            {stats.improvements.length > 0 ? (
              stats.improvements.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-yellow-50 rounded"
                >
                  <span className="text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-500">
                    mentioned {item.count}x
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No improvements suggested yet
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Interviews Table */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Interviews</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Role</th>
                <th className="text-left py-3 px-4">Questions</th>
                <th className="text-left py-3 px-4">Score</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Pass?</th>
              </tr>
            </thead>
            <tbody>
              {interviews.slice(0, 5).map((interview) => {
                const avgScore = interview.stats?.averageScore || 0;
                const passed = avgScore >= 7;

                return (
                  <tr key={interview._id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      {new Date(interview.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 font-medium">
                      {interview.config?.role || "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      {interview.questions?.length || 0}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-bold ${getScoreColor(avgScore)}`}>
                        {avgScore.toFixed(1)}/10
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          interview.status === "completed"
                            ? "bg-green-100 text-green-700"
                            : interview.status === "evaluated"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {interview.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {passed ? (
                        <span className="text-green-600 font-bold">
                          ✅ Pass
                        </span>
                      ) : (
                        <span className="text-red-600">❌ Fail</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={() => window.print()} variant="outline">
          🖨️ Print Report
        </Button>
        <Button
          onClick={() => navigate(`/user/${userId}/dashboard`)}
          variant="primary"
        >
          Back to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default Statistics;
