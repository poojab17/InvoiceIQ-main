import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import DashboardLayout from "../layouts/DashboardLayout";

import Dashboard from "../pages/dashboard/Dashboard";
import Upload from "../pages/upload/Upload";

// Future Pages
// import Analytics from "../pages/analytics/Analytics";
// import History from "../pages/history/History";
// import Settings from "../pages/settings/Settings";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<DashboardLayout />}>
          {/* Dashboard */}
          <Route
            path="/dashboard"
            element={<Dashboard />}
          />

          {/* Upload */}
          <Route
            path="/upload"
            element={<Upload />}
          />

          {/* Future Routes */}
          {/* <Route path="/analytics" element={<Analytics />} /> */}
          {/* <Route path="/history" element={<History />} /> */}
          {/* <Route path="/settings" element={<Settings />} /> */}
        </Route>

        {/* Redirect root to dashboard */}
        <Route
          path="/"
          element={<Navigate to="/dashboard" replace />}
        />

        {/* Unknown route */}
        <Route
          path="*"
          element={<Navigate to="/dashboard" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}