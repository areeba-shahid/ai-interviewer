import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { interviewAPI } from "../services/interviewAPI";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import toast from "react-hot-toast";

const Interviews = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);
      const data = await interviewAPI.getAll();
      setInterviews(data.data || []);
    } catch (error) {
      console.error("Failed to load interviews:", error);
      toast.error("Failed to load interviews");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-700";
      case "in-progress":
        return "bg-yellow-100 text-yellow-700";
      case "pending":
        return "bg-gray-100 text-gray-700";
      case "evaluated":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Interviews</h1>
          <p className="text-gray-600 mt-2">
            Track and review all your interview sessions
          </p>
        </div>
        <Link to={`/user/${userId}/interview-setup`}>
          <Button>+ New Interview</Button>
        </Link>
      </div>

      {/* Interviews List */}
      {interviews.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2">No interviews yet</h3>
          <p className="text-gray-600 mb-6">
            Start your first interview practice session
          </p>
          <Link to={`/user/${userId}/interview-setup`}>
            <Button>Start Your First Interview</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {interviews.map((interview) => (
            <Link
              key={interview._id}
              to={`/user/${userId}/interviews/${interview._id}`}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">
                      {interview.config?.role || "Interview"}
                      <span
                        className={`ml-3 px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          interview.status
                        )}`}
                      >
                        {interview.status}
                      </span>
                    </h3>

                    <div className="flex gap-4 text-sm text-gray-600 mb-3">
                      <span>Difficulty: {interview.config?.difficulty}</span>
                      <span>Type: {interview.config?.interviewType}</span>
                      <span>Questions: {interview.config?.numQuestions}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {interview.config?.techStack?.map((tech) => (
                        <span
                          key={tech}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {formatDate(interview.createdAt)}
                    </p>
                    {interview.stats?.averageScore > 0 && (
                      <p className="mt-2 text-lg font-semibold text-green-600">
                        Score: {interview.stats.averageScore.toFixed(1)}/10
                      </p>
                    )}
                  </div>
                </div>

                {/* Progress for in-progress interviews */}
                {interview.status === "in-progress" && interview.stats && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress</span>
                      <span>
                        {interview.stats.answeredQuestions || 0}/
                        {interview.stats.totalQuestions || 0}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600"
                        style={{
                          width: `${
                            ((interview.stats.answeredQuestions || 0) /
                              (interview.stats.totalQuestions || 1)) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Interviews;
