import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { userAPI } from "../services/api";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Input from "../components/UI/Input";
import toast from "react-hot-toast";

const Settings = () => {
  const { userId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const [settings, setSettings] = useState({
    // Notification Preferences
    emailNotifications: true,
    interviewFeedback: true,
    weeklyReports: false,
    tipsAndResources: true,
    marketingEmails: false,

    // Privacy Settings
    profilePublic: false,
    shareProgress: false,
    showEmail: false,
    activityStatus: true,

    // Theme Preferences
    theme: "system",
    language: "en",

    // Interview Preferences
    defaultDifficulty: "medium",
    defaultQuestions: 5,
    autoSaveAnswers: true,

    // Account Info
    email: user?.email || "",
    name: user?.displayName || "",
  });

  // Load user settings from profile
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const profileData = await userAPI.getProfile();
        const prefs = profileData.data?.preferences || {};

        setSettings((prev) => ({
          ...prev,
          emailNotifications: prefs.emailNotifications ?? true,
          theme: prefs.theme || "system",
          language: prefs.language || "en",
          name: profileData.data?.name || prev.name,
          email: profileData.data?.email || prev.email,
        }));
      } catch (error) {
        console.error("Failed to load settings:", error);
      }
    };

    loadSettings();
  }, []);

  const handleToggle = (key) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await userAPI.updateProfile({
        name: settings.name,
        email: settings.email,
        preferences: {
          emailNotifications: settings.emailNotifications,
          theme: settings.theme,
          language: settings.language,
        },
      });

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Failed to save settings:", error);
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true);
      return;
    }

    try {
      setLoading(true);
      await userAPI.deleteAccount();
      toast.success("Account deleted successfully");
      navigate("/");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
      setDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <Button onClick={handleSave} isLoading={loading}>
          Save Changes
        </Button>
      </div>

      {/* Account Information */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
          Account Information
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <Input
            label="Display Name"
            value={settings.name}
            onChange={(e) => handleChange("name", e.target.value)}
            placeholder="Your name"
          />
          <Input
            label="Email Address"
            type="email"
            value={settings.email}
            onChange={(e) => handleChange("email", e.target.value)}
            placeholder="your@email.com"
          />
        </div>
      </Card>

      {/* Notification Preferences */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
          Notification Preferences
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div>
              <span className="font-medium">Email Notifications</span>
              <p className="text-sm text-gray-500">
                Receive notifications via email
              </p>
            </div>
            <button
              onClick={() => handleToggle("emailNotifications")}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.emailNotifications ? "bg-blue-600" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.emailNotifications ? "translate-x-6" : ""
                }`}
              />
            </button>
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div>
              <span className="font-medium">Interview Feedback</span>
              <p className="text-sm text-gray-500">
                Get notified when interview feedback is ready
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.interviewFeedback}
              onChange={() => handleToggle("interviewFeedback")}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div>
              <span className="font-medium">Weekly Progress Reports</span>
              <p className="text-sm text-gray-500">
                Receive weekly summary of your progress
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.weeklyReports}
              onChange={() => handleToggle("weeklyReports")}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
            <div>
              <span className="font-medium">Tips & Resources</span>
              <p className="text-sm text-gray-500">
                Get interview tips and preparation resources
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.tipsAndResources}
              onChange={() => handleToggle("tipsAndResources")}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </Card>

      {/* Theme & Language */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">Appearance</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={settings.theme}
              onChange={(e) => handleChange("theme", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System Default</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={settings.language}
              onChange={(e) => handleChange("language", e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="de">Deutsch</option>
              <option value="ur">اردو</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Interview Preferences */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
          Interview Preferences
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Difficulty
            </label>
            <select
              value={settings.defaultDifficulty}
              onChange={(e) =>
                handleChange("defaultDifficulty", e.target.value)
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Questions
            </label>
            <select
              value={settings.defaultQuestions}
              onChange={(e) =>
                handleChange("defaultQuestions", Number(e.target.value))
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            >
              <option value="3">3 Questions</option>
              <option value="5">5 Questions</option>
              <option value="7">7 Questions</option>
              <option value="10">10 Questions</option>
            </select>
          </div>
        </div>
        <div className="mt-4">
          <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <input
              type="checkbox"
              checked={settings.autoSaveAnswers}
              onChange={() => handleToggle("autoSaveAnswers")}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium">Auto-save answers</span>
              <p className="text-sm text-gray-500">
                Automatically save your answers during interviews
              </p>
            </div>
          </label>
        </div>
      </Card>

      {/* Privacy Settings */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-4 pb-2 border-b">
          Privacy Settings
        </h2>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium">Public Profile</span>
              <p className="text-sm text-gray-500">
                Allow others to view your profile
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.profilePublic}
              onChange={() => handleToggle("profilePublic")}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium">Share Progress</span>
              <p className="text-sm text-gray-500">
                Share your interview progress with recruiters
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.shareProgress}
              onChange={() => handleToggle("shareProgress")}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium">Show Email</span>
              <p className="text-sm text-gray-500">
                Display your email on public profile
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.showEmail}
              onChange={() => handleToggle("showEmail")}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>

          <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <span className="font-medium">Activity Status</span>
              <p className="text-sm text-gray-500">
                Show when you're active on the platform
              </p>
            </div>
            <input
              type="checkbox"
              checked={settings.activityStatus}
              onChange={() => handleToggle("activityStatus")}
              className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
            />
          </label>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="border-2 border-red-200">
        <h2 className="text-xl font-semibold mb-4 text-red-600">Danger Zone</h2>
        <p className="text-gray-600 mb-4">
          Once you delete your account, there is no going back. All your data
          will be permanently removed.
        </p>
        <Button
          onClick={handleDeleteAccount}
          variant="danger"
          isLoading={loading && deleteConfirm}
        >
          {deleteConfirm ? "Click again to confirm" : "Delete Account"}
        </Button>
        {deleteConfirm && (
          <p className="text-sm text-red-600 mt-2">
            Are you absolutely sure? This action cannot be undone.
          </p>
        )}
      </Card>
    </div>
  );
};

export default Settings;
