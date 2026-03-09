import { useState, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { signInWithGoogle } from "../services/firebase";
import { auth } from "../services/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "../hooks/useAuth";
import Button from "../components/UI/Button";
import Card from "../components/UI/Card";
import Input from "../components/UI/Input";
import toast from "react-hot-toast";
import { userAPI } from "../services/api"; // Import the API

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});

  const from = location.state?.from?.pathname || "/dashboard";

  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      console.log("🔵 Starting Google sign-in...");
      const { user: firebaseUser, error } = await signInWithGoogle();

      if (error) {
        console.error("❌ Google sign-in error:", error);
        toast.error(error);
      } else if (firebaseUser) {
        console.log("✅ Google sign-in successful");
        console.log("User UID:", firebaseUser.uid);

        // Get the Firebase token
        const token = await firebaseUser.getIdToken();
        console.log("✅ Got Firebase token");

        // Sync user with backend
        try {
          console.log("⏳ Syncing user with backend...");

          // Method 1: Use the API service
          const profile = await userAPI.getProfile();
          console.log("✅ User synced successfully:", profile);

          toast.success("Successfully logged in!");
          navigate(from, { replace: true });
        } catch (apiError) {
          console.error("❌ Backend sync error:", apiError);

          // If profile fetch fails, try to create user explicitly
          try {
            const response = await fetch(
              `${import.meta.env.VITE_API_URL}/users/profile`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("✅ Manual fetch successful:", data);
            toast.success("Successfully logged in!");
            navigate(from, { replace: true });
          } catch (fetchError) {
            console.error("❌ Manual fetch failed:", fetchError);
            toast.error("Connected to Firebase but backend sync failed");
            // Still navigate since Firebase auth worked
            navigate(from, { replace: true });
          }
        }
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      toast.error("Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // ... rest of your component code (validateForm, handleEmailLogin, handleChange, return statement)

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    return newErrors;
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();

    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setEmailLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);

      toast.success("Logged in successfully!");
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      if (
        error.code === "auth/user-not-found" ||
        error.code === "auth/wrong-password"
      ) {
        toast.error("Invalid email or password");
      } else if (error.code === "auth/too-many-requests") {
        toast.error("Too many failed attempts. Try again later");
      } else {
        toast.error("Failed to log in");
      }
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-xl">
            <span className="text-white text-3xl font-bold">AI</span>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h2>
          <p className="text-gray-600">
            Sign in to continue your interview practice
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-8">
          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleSignIn}
            isLoading={isLoading}
            variant="outline"
            className="w-full flex items-center justify-center gap-3 py-3 mb-6 border-2 hover:border-blue-600 hover:text-blue-600 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">
                Or continue with email
              </span>
            </div>
          </div>
          {/* Email Sign In Form */}
          <form onSubmit={handleEmailLogin} className="space-y-4">
            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="you@example.com"
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
            />

            <div className="text-right">
              <button
                type="button"
                onClick={() => navigate("/forgot-password")}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              isLoading={emailLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
            >
              Sign In
            </Button>
          </form>
          {/* Sign Up Link */}
          <p className="text-center text-gray-600 text-sm mt-6">
            Don't have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-semibold hover:underline"
            >
              Sign up
            </Link>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Login;
