import React from "react";
import ReactDOM from "react-dom/client";
import * as Sentry from "@sentry/react";
import "@/index.css";
import App from "@/App";

if (process.env.REACT_APP_SENTRY_DSN) {
  const isProduction = process.env.NODE_ENV === "production";

  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.NODE_ENV || "development",
    integrations: isProduction
      ? [new Sentry.BrowserTracing({
          tracePropagationTargets: [
            /^https:\/\/api\.shandecors\.store/,
            /^\//,
          ],
        })]
      : [],
    // Avoid attaching sentry-trace headers to localhost API calls during dev (CORS preflight noise)
    tracesSampleRate: isProduction ? 0.1 : 0,
    // Suppress noisy browser extension / third-party errors
    ignoreErrors: [
      "ResizeObserver loop limit exceeded",
      "ResizeObserver loop completed with undelivered notifications",
      "Non-Error promise rejection captured",
    ],
  });

  // Explicitly capture unhandled promise rejections
  window.addEventListener("unhandledrejection", ({ reason }) => {
    Sentry.captureException(reason);
  });
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
