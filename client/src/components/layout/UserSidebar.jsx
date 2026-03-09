import { NavLink, useParams } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const UserSidebar = () => {
  const { userId } = useParams();
  const { user } = useAuth();

  // Add these menu items
  const menuItems = [
    {
      name: "Dashboard",
      path: `/user/${userId}/dashboard`,
      icon: "📊",
    },
    {
      name: "Profile",
      path: `/user/${userId}/profile`,
      icon: "👤",
    },
    {
      name: "Profile Setup",
      path: `/user/${userId}/profile-setup`,
      icon: "⚙️",
    },
    {
      name: "Interviews",
      path: `/user/${userId}/interviews`,
      icon: "🎯",
    },
    {
      name: "New Interview",
      path: `/user/${userId}/interview-setup`,
      icon: "➕",
    },
    {
      name: "Statistics",
      path: `/user/${userId}/statistics`,
      icon: "📈",
    },
    {
      name: "Notifications",
      path: `/user/${userId}/notifications`,
      icon: "🔔",
    },
    {
      name: "Settings",
      path: `/user/${userId}/settings`,
      icon: "⚙️",
    },
  ];
  return (
    <aside className="fixed left-0 top-20 w-64 h-[calc(100vh-5rem)] bg-white shadow-lg overflow-y-auto">
      {/* User Profile Summary */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {user?.photoURL ? (
            <img
              src={user.photoURL}
              alt={user.displayName}
              className="w-12 h-12 rounded-full object-cover border-2 border-blue-600"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
              {user?.displayName?.charAt(0) ||
                user?.email?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {user?.displayName || user?.email?.split("@")[0]}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-50 to-purple-50 text-blue-600"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <span
                  className={({ isActive }) =>
                    isActive ? "text-blue-600" : "text-gray-400"
                  }
                >
                  {item.icon}
                </span>
                <span className="text-sm font-medium">{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default UserSidebar;
