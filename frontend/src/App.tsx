import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import SigninPage from "./pages/SigninPage";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ClassesPage from "./pages/ClassesPage";
import CalendarPage from "./pages/CalendarPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import ClassroomPage from "./pages/ClassroomPage";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth & Public Routes */}
        <Route
          path="/"
          element={<LandingPage />}
        />
        <Route path="/auth">
          <Route
            path="sign-up"
            element={<SignupPage />}
          />
          <Route
            path="sign-in"
            element={<SigninPage />}
          />
        </Route>

        {/* Protected App Routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />
            <Route
              path="/classes"
              element={<ClassesPage />}
            />
            <Route
              path="/classroom/:id"
              element={<ClassroomPage />}
            />
            <Route
              path="/calendar"
              element={<CalendarPage />}
            />
            <Route
              path="/notifications"
              element={<NotificationsPage />}
            />
            <Route
              path="/settings"
              element={<SettingsPage />}
            />
          </Route>
        </Route>

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="flex flex-col items-center justify-center min-h-screen">
              <h1 className="text-4xl font-bold">404 - Page Not Found</h1>
              <p className="mt-2 text-gray-600">
                The page you're looking for doesn't exist.
              </p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
