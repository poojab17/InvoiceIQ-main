import {
  Navigate,
  useLocation,
} from "react-router-dom";

import { useAuth } from "../../context/AuthContext";


export default function ProtectedRoute({
  children,
}) {
  const {
    isAuthenticated,
    loading,
  } = useAuth();

  const location = useLocation();


  // Session restore ho rahi hai
  if (loading) {
    return (
      <div
        className="
          min-h-screen
          bg-[#0B1120]
          flex
          items-center
          justify-center
        "
      >
        <div className="text-center">

          <div
            className="
              w-10
              h-10
              border-4
              border-indigo-500
              border-t-transparent
              rounded-full
              animate-spin
              mx-auto
            "
          />

          <p className="text-gray-400 mt-4 text-sm">
            Restoring your session...
          </p>

        </div>
      </div>
    );
  }


  // Not logged in
  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
        }}
      />
    );
  }


  // Logged in
  return children;
}