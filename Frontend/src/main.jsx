import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import {
  BrowserRouter,
} from "react-router-dom";

import {
  Toaster,
} from "react-hot-toast";

import App from "./App.jsx";

import {
  AuthProvider,
} from "./context/AuthContext.jsx";

import ErrorBoundary from "./components/ErrorBoundary.jsx";

import "./index.css";


createRoot(
  document.getElementById(
    "root"
  )
).render(
  <StrictMode>

    <BrowserRouter>

      <ErrorBoundary>

        <AuthProvider>

          <App />

          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 3500,

              style: {
                background:
                  "#111827",

                color:
                  "#f3f4f6",

                border:
                  "1px solid rgba(255,255,255,0.08)",
              },
            }}
          />

        </AuthProvider>

      </ErrorBoundary>

    </BrowserRouter>

  </StrictMode>
);