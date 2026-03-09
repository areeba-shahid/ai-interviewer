import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useUserData } from "../hooks/useUserData";
import { interviewAPI } from "../services/interviewAPI";
import { notificationAPI } from "../services/notificationAPI";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import toast from "react-hot-toast";

// For charts (install: npm install recharts)
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useUserData();
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    totalQuestions: 0,
    averageScore: 0,
    bestScore: 0,
    passRate: 0,
    practiceHours: 0,
    strengths: [],
    improvements: [],
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [scoreTrend, setScoreTrend] = useState([]);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Load all interviews
      const interviewsData = await interviewAPI.getAll();
      console.log("📥 Raw interviews data:", interviewsData);

      // Get full details for each interview
      const allInterviews = [];
      if (interviewsData.data && Array.isArray(interviewsData.data)) {
        for (const interview of interviewsData.data) {
          try {
            const fullDetails = await interviewAPI.getOne(interview._id);
            if (fullDetails.data) {
              allInterviews.push(fullDetails.data);
            }
          } catch (err) {
            console.error(`Failed to load details for ${interview._id}:`, err);
          }
        }
      }

      console.log("📊 Full interviews with details:", allInterviews);
      setInterviews(allInterviews);

      // Load unread notifications count
      const notifData = await notificationAPI.getAll({
        unreadOnly: true,
        limit: 1,
      });
      setUnreadNotifications(notifData.pagination?.unreadCount || 0);

      // Calculate statistics
      calculateStats(allInterviews);

      // Get recent activity
      getRecentActivity(allInterviews);

      // Prepare score trend for chart
      prepareScoreTrend(allInterviews);
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (interviews) => {
    if (!interviews || interviews.length === 0) {
      console.log("No interviews to calculate stats");
      return;
    }

    console.log("Calculating stats for", interviews.length, "interviews");

    let totalScore = 0;
    let totalAnswered = 0;
    let bestScore = 0;
    let passedCount = 0;
    let totalTime = 0;
    const allStrengths = [];
    const allImprovements = [];

    interviews.forEach((interview, idx) => {
      console.log(`\nInterview ${idx + 1}:`, interview._id);
      console.log("Role:", interview.config?.role);

      const questions = interview.questions || [];
      console.log("Total questions:", questions.length);

      const answered = questions.filter((q) => {
        const hasAnswer = q.answer && q.answer.text;
        if (hasAnswer)
          console.log(
            `  Q${questions.indexOf(q)}: Has answer, score: ${
              q.feedback?.score
            }`
          );
        return hasAnswer;
      });

      console.log("Answered questions:", answered.length);
      totalAnswered += answered.length;

      const interviewScore = answered.reduce(
        (sum, q) => sum + (q.feedback?.score || 0),
        0
      );
      console.log("Interview total score:", interviewScore);

      totalScore += interviewScore;

      const interviewAvg =
        answered.length > 0 ? interviewScore / answered.length : 0;
      console.log("Interview average:", interviewAvg);

      if (interviewAvg > bestScore) bestScore = interviewAvg;
      if (interviewAvg >= 7) passedCount++;

      totalTime += interview.stats?.totalTime || 0;

      questions.forEach((q) => {
        if (q.feedback) {
          if (q.feedback.strengths) {
            allStrengths.push(...q.feedback.strengths);
          }
          if (q.feedback.improvements) {
            allImprovements.push(...q.feedback.improvements);
          }
        }
      });
    });

    console.log("\nFinal calculations:");
    console.log("totalAnswered:", totalAnswered);
    console.log("totalScore:", totalScore);
    console.log("allStrengths:", allStrengths);
    console.log("allImprovements:", allImprovements);

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
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const topImprovements = Object.entries(improvementCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));

    const averageScore =
      totalAnswered > 0 ? (totalScore / totalAnswered).toFixed(1) : 0;

    setStats({
      totalInterviews: interviews.length,
      totalQuestions: totalAnswered,
      averageScore: averageScore,
      bestScore: bestScore > 0 ? bestScore.toFixed(1) : "0.0",
      passRate:
        interviews.length > 0
          ? ((passedCount / interviews.length) * 100).toFixed(1)
          : "0.0",
      practiceHours: (totalTime / 3600).toFixed(1),
      strengths: topStrengths,
      improvements: topImprovements,
    });
  };

  const getRecentActivity = (interviews) => {
    const activities = interviews.slice(0, 5).map((interview) => ({
      id: interview._id,
      type: "interview",
      title: `Interview: ${interview.config?.role || "Unknown Role"}`,
      time: new Date(interview.createdAt),
      score: interview.stats?.averageScore?.toFixed(1) || "0.0",
      status: interview.status,
    }));

    console.log("Recent activities:", activities);
    setRecentActivity(activities);
  };

  const prepareScoreTrend = (interviews) => {
    const trend = interviews
      .filter((i) => i.stats?.averageScore > 0)
      .slice(0, 7)
      .map((interview, index) => ({
        name: `#${index + 1}`,
        score: interview.stats?.averageScore || 0,
        date: new Date(interview.createdAt).toLocaleDateString(),
      }))
      .reverse();

    console.log("Score trend:", trend);
    setScoreTrend(trend);
  };

  const getScoreColor = (score) => {
    const numScore = parseFloat(score);
    if (numScore >= 7) return "text-green-600";
    if (numScore >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1", "#8b5cf6"];

  if (authLoading || profileLoading || loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Calculate if there's any data to show
  const hasData = stats.totalQuestions > 0;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      {/* Welcome Header with Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {profile?.name || user?.displayName || "User"}! 👋
          </h1>
          <p className="text-gray-600">
            Here's your interview progress and statistics
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button
            onClick={() => navigate(`/user/${user?.uid}/interview-setup`)} // 🔥 FIXED
            className="bg-gradient-to-r from-blue-600 to-purple-600"
          >
            + New Interview
          </Button>
          <Button
            onClick={() => navigate(`/user/${user?.uid}/statistics`)} // 🔥 FIXED
            variant="outline"
          >
            View Statistics
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Total Interviews</p>
            <span className="text-2xl">📊</span>
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {stats.totalInterviews}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {stats.totalQuestions} questions answered
          </p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Average Score</p>
            <span className="text-2xl">🎯</span>
          </div>
          <p
            className={`text-3xl font-bold ${getScoreColor(
              stats.averageScore
            )}`}
          >
            {stats.averageScore}/10
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Best: {stats.bestScore}/10
          </p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Pass Rate</p>
            <span className="text-2xl">✅</span>
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.passRate}%</p>
          <p className="text-sm text-gray-500 mt-2">Score ≥ 7 required</p>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-600">Practice Time</p>
            <span className="text-2xl">⏱️</span>
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {stats.practiceHours}h
          </p>
          <p className="text-sm text-gray-500 mt-2">Total practice hours</p>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Score Trend Chart */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Score Trend</h3>
          {scoreTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={scoreTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 10]} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[300px] flex items-center justify-center text-gray-500">
              No interview data yet. Start practicing to see your progress!
            </div>
          )}
        </Card>

        {/* Performance Overview */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Overview</h3>
          <div className="h-[300px] flex items-center justify-center">
            {hasData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Passed", value: parseFloat(stats.passRate) },
                      {
                        name: "Needs Work",
                        value: 100 - parseFloat(stats.passRate),
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No performance data yet</p>
            )}
          </div>
        </Card>
      </div>

      {/* Strengths & Improvements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-green-700">
            ✅ Your Strengths
          </h3>
          {stats.strengths.length > 0 ? (
            <div className="space-y-3">
              {stats.strengths.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-500">
                    mentioned {item.count}x
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No strengths recorded yet
            </p>
          )}
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 text-yellow-700">
            📝 To Improve
          </h3>
          {stats.improvements.length > 0 ? (
            <div className="space-y-3">
              {stats.improvements.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg"
                >
                  <span className="font-medium text-gray-700">{item.name}</span>
                  <span className="text-sm text-gray-500">
                    mentioned {item.count}x
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No improvements suggested yet
            </p>
          )}
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Recent Activity</h3>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate("interviews")}
          >
            View All
          </Button>
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => navigate(`interviews/${activity.id}`)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🎯</span>
                  <div>
                    <p className="font-medium">{activity.title}</p>
                    <p className="text-sm text-gray-500">
                      {activity.time.toLocaleDateString()} •{" "}
                      {activity.time.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`font-bold ${getScoreColor(activity.score)}`}
                  >
                    {activity.score}/10
                  </span>
                  <p className="text-xs text-gray-500 mt-1 capitalize">
                    {activity.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">No interviews yet</p>
            <Button onClick={() => navigate("interview-setup")}>
              Start Your First Interview
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLink
          icon="📊"
          title="Statistics"
          description="View detailed analytics"
          onClick={() => navigate(`/user/${user?.uid}/statistics`)} // 🔥 FIXED
        />
        <QuickLink
          icon="📝"
          title="Interviews"
          description="Review past interviews"
          onClick={() => navigate(`/user/${user?.uid}/interviews`)} // 🔥 FIXED
        />
        <QuickLink
          icon="⚙️"
          title="Settings"
          description="Manage preferences"
          onClick={() => navigate(`/user/${user?.uid}/settings`)} // 🔥 FIXED
        />
        <QuickLink
          icon="🔔"
          title="Notifications"
          description={`${unreadNotifications} unread`}
          onClick={() => navigate(`/user/${user?.uid}/notifications`)} // 🔥 FIXED
          badge={unreadNotifications}
        />
      </div>
    </div>
  );
};

// Helper component for quick links
const QuickLink = ({ icon, title, description, onClick, badge }) => (
  <Card
    className="p-4 text-center hover:shadow-lg transition-all cursor-pointer hover:scale-105 relative"
    onClick={onClick}
  >
    <div className="text-3xl mb-2">{icon}</div>
    <h4 className="font-semibold">{title}</h4>
    <p className="text-xs text-gray-500 mt-1">{description}</p>
    {badge > 0 && (
      <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
        {badge}
      </span>
    )}
  </Card>
);

export default Dashboard;
