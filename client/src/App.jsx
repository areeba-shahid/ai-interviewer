import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import Pricing from "./pages/Pricing";
import Notifications from "./pages/Notifications";
import Profile from "./pages/Profile";
import Statistics from "./pages/Statistics";
import Interviews from "./pages/Interviews";
import Settings from "./pages/Settings";
import InterviewSetup from "./pages/InterviewSetup";
import InterviewSession from "./pages/InterviewSession";
import ProfileSetupWizard from "./components/Profile/ProfileSetupWizard";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import PublicRoute from "./components/Auth/PublicRoute";
import UserLayout from "./components/layout/UserLayout";
import { useAuth } from "./hooks/useAuth";

// Wrapper component for dashboard redirect
const DashboardRedirect = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate(`/user/${user.uid}/dashboard`, { replace: true });
    }
  }, [user, navigate]);

  return null;
};

function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow pt-20">
          <Routes>
            {/* Public Routes - Accessible to everyone */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />

            {/* Auth Routes - Only when NOT logged in */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <Signup />
                </PublicRoute>
              }
            />

            {/* Protected User Routes with UserID in URL */}
            <Route
              path="/user/:userId"
              element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }
            >
              {/* Main Pages */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="profile" element={<Profile />} />
              <Route path="profile-setup" element={<ProfileSetupWizard />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="statistics" element={<Statistics />} />
              <Route path="settings" element={<Settings />} />
              {/* 👇 ADD THESE INTERVIEW ROUTES */}
              <Route path="interviews" element={<Interviews />} />
              <Route
                path="interviews/:interviewId"
                element={<InterviewSession />}
              />
              <Route path="interview-setup" element={<InterviewSetup />} />

              {/* Progress & Analytics */}
              <Route
                path="progress"
                element={
                  <div className="p-8">Progress Tracking (Coming Soon)</div>
                }
              />
              <Route
                path="analytics"
                element={<div className="p-8">Analytics (Coming Soon)</div>}
              />
              {/* Achievements */}
              <Route
                path="achievements"
                element={<div className="p-8">Achievements (Coming Soon)</div>}
              />
              {/* Help & Support */}
              <Route
                path="help"
                element={<div className="p-8">Help Center (Coming Soon)</div>}
              />
              <Route
                path="feedback"
                element={<div className="p-8">Feedback (Coming Soon)</div>}
              />
            </Route>

            {/* Legacy Routes - Redirect to user-specific routes */}
            <Route path="/dashboard" element={<DashboardRedirect />} />
            <Route path="/profile" element={<DashboardRedirect />} />
            <Route path="/settings" element={<DashboardRedirect />} />
            <Route path="/notifications" element={<DashboardRedirect />} />

            {/* Catch all - 404 */}
            <Route
              path="*"
              element={
                <div className="p-8 text-center">
                  <h1 className="text-4xl font-bold mb-4">404</h1>
                  <p className="text-gray-600 mb-4">Page not found</p>
                  <button
                    onClick={() => window.history.back()}
                    className="text-blue-600 hover:underline"
                  >
                    Go Back
                  </button>
                </div>
              }
            />
          </Routes>
        </main>
        <Footer />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#363636",
              color: "#fff",
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
            },
          }}
        />
      </div>
    </Router>
  );
}

export default App;
