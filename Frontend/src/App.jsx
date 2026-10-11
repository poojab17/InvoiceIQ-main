import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";

import Dashboard from "./pages/dashboard/Dashboard";
import Upload from "./pages/upload/Upload";
import Invoices from "./pages/invoices/Invoices";
import InvoiceDetails from "./pages/invoices/InvoiceDetails";
import Analytics from "./pages/analytics/Analytics";
import AIInsights from "./pages/insights/AIInsights";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";


export default function App() {
  return (
    <Routes>

      {/* ====================================== */}
      {/* PUBLIC ROUTES */}
      {/* ====================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={<ForgotPassword />}
      />


      {/* ====================================== */}
      {/* PROTECTED APPLICATION */}
      {/* ====================================== */}

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >

        {/* Default */}
        <Route
          index
          element={
            <Navigate
              to="/dashboard"
              replace
            />
          }
        />


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


        {/* Invoices */}
        <Route
          path="/invoices"
          element={<Invoices />}
        />


        {/* Invoice Details */}
        <Route
          path="/invoices/:id"
          element={
            <InvoiceDetails />
          }
        />


        {/* Analytics */}
        <Route
          path="/analytics"
          element={<Analytics />}
        />


        {/* AI Insights */}
        <Route
          path="/ai-insights"
          element={<AIInsights />}
        />

      </Route>


      {/* ====================================== */}
      {/* UNKNOWN ROUTES */}
      {/* ====================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/dashboard"
            replace
          />
        }
      />

    </Routes>
  );
}