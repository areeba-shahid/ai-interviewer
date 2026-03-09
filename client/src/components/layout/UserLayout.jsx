import { Outlet, useParams, Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import UserSidebar from "./UserSidebar";

const UserLayout = () => {
  const { userId } = useParams();
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Check if the userId in URL matches the logged-in user's ID
  if (user?.uid !== userId) {
    return <Navigate to={`/user/${user?.uid}/dashboard`} replace />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <UserSidebar />
      <div className="flex-1 ml-64 p-8">
        <Outlet />
      </div>
    </div>
  );
};

export default UserLayout;
