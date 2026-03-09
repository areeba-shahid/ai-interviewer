import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { signOut } from "firebase/auth";
import { auth } from "../../services/firebase";
import Button from "../UI/Button";
import { useState, useEffect } from "react";
import { userAPI } from "../../services/api";
import { useUserData } from "../../hooks/useUserData";
const Navbar = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { photo, loading: photoLoading } = useUserData();

  // 🔥 Fetch profile photo from MongoDB (using dedicated photo endpoint)
  useEffect(() => {
    const fetchProfilePhoto = async () => {
      if (user) {
        try {
          setPhotoLoading(true);
          // Use the dedicated photo endpoint (faster, smaller payload)
          const response = await userAPI.getPhoto();
          if (response?.photoURL) {
            setProfilePhoto(response.photoURL);
            console.log("📸 Profile photo loaded from photo endpoint");
          }
        } catch (error) {
          console.error(
            "Failed to load profile photo from photo endpoint:",
            error
          );

          // Fallback: try to get from profile (slower, but works)
          try {
            const profileResponse = await userAPI.getProfile();
            if (profileResponse.data?.photoURL) {
              setProfilePhoto(profileResponse.data.photoURL);
              console.log("📸 Profile photo loaded from profile fallback");
            }
          } catch (profileError) {
            console.error(
              "Failed to load profile photo from profile:",
              profileError
            );
          }
        } finally {
          setPhotoLoading(false);
        }
      } else {
        // Clear photo when user logs out
        setProfilePhoto(null);
      }
    };

    fetchProfilePhoto();
  }, [user]);
  // Fetch unread count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (user) {
        try {
          const data = await notificationAPI.getAll({
            unreadOnly: true,
            limit: 1,
          });
          setUnreadCount(data.pagination?.unreadCount || 0);
        } catch (error) {
          console.error("Failed to fetch unread count:", error);
        }
      }
    };

    fetchUnreadCount();
  }, [user]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleNavClick = (e, path, sectionId) => {
    e.preventDefault();

    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Home", path: "/", section: null },
    { name: "Features", path: "/", section: "features" },
    { name: "Pricing", path: "/pricing", section: null },
    { name: "About", path: "/about", section: null },
    ...(user ? [{ name: "Dashboard", path: "/dashboard", section: null }] : []),
  ];

  // Determine which photo to show (prioritize uploaded photo)
  const displayPhoto = photo || user?.photoURL;
  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-lg py-2"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg">
                <span className="text-white font-bold text-xl">AI</span>
              </div>
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-70 transition duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Interviewer.ai
              </span>
              <span className="text-xs text-gray-500 -mt-1">
                Ace Your Interview
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) =>
              link.section ? (
                <a
                  key={link.name}
                  href={`/#${link.section}`}
                  onClick={(e) => handleNavClick(e, link.path, link.section)}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    location.pathname === link.path &&
                    location.hash === `#${link.section}`
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/50"
                  }`}
                >
                  {link.name}
                </a>
              ) : (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 group ${
                    location.pathname === link.path
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:text-blue-600 hover:bg-blue-50/50"
                  }`}
                >
                  {link.name}
                </Link>
              )
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <div className="flex items-center space-x-4">
                    {/* Notification Bell */}
                    <Link
                      to={`/user/${user?.uid}/notifications`}
                      className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                        />
                      </svg>
                      {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                          {unreadCount > 99 ? "99+" : unreadCount}
                        </span>
                      )}
                    </Link>

                    {/* User Menu - 🔥 FIXED: Shows uploaded photo */}
                    <div className="relative group">
                      <button className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                        {displayPhoto ? (
                          <img
                            src={displayPhoto}
                            alt={user.displayName || "Profile"}
                            className="w-10 h-10 rounded-full border-2 border-blue-600 object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                            {user.displayName?.charAt(0) ||
                              user.email?.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="hidden lg:block text-left">
                          <p className="text-sm font-semibold text-gray-700">
                            {user.displayName || user.email?.split("@")[0]}
                          </p>
                        </div>
                        <svg
                          className="w-4 h-4 text-gray-500"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>

                      {/* Dropdown Menu */}
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 transform origin-top-right">
                        <div className="py-2">
                          <Link
                            to={`/user/${user.uid}/profile`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          >
                            Your Profile
                          </Link>
                          <Link
                            to={`/user/${user.uid}/settings`}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                          >
                            Settings
                          </Link>
                          <div className="border-t border-gray-100 my-2"></div>
                          <button
                            onClick={handleLogout}
                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                          >
                            Sign Out
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <Link to="/login">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-300 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        Log in
                      </Button>
                    </Link>
                    <Link to="/signup">
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-blue-600 to-purple-300 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          >
            {mobileMenuOpen ? (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) =>
                link.section ? (
                  <a
                    key={link.name}
                    href={`/#${link.section}`}
                    onClick={(e) => {
                      handleNavClick(e, link.path, link.section);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.path &&
                      location.hash === `#${link.section}`
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </a>
                ) : (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === link.path
                        ? "bg-blue-50 text-blue-600"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              )}
              {!user ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-100">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button
                      variant="outline"
                      className="w-full border-blue-600 text-blue-600"
                    >
                      Log in
                    </Button>
                  </Link>
                  <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="pt-4 border-t border-gray-100">
                  <div className="flex items-center space-x-3 px-4 py-3">
                    {displayPhoto ? (
                      <img
                        src={displayPhoto}
                        alt={user.displayName}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                        {user.displayName?.charAt(0) ||
                          user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-semibold text-gray-700">
                        {user.displayName || user.email?.split("@")[0]}
                      </p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
