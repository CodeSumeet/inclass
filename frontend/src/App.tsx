import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignupPage";
import SignInPage from "./pages/SigninPage";
import { ProtectedRoute } from "./components";
import AppLayout from "./layouts/AppLayout";
import DashboardPage from "./pages/DashboardPage";
import ProfilePage from "./pages/ProfilePage";
import ClassesPage from "./pages/ClassesPage";
import ClassroomPage from "./pages/ClassroomPage";
import CalendarPage from "./pages/CalendarPage";
import NotificationsPage from "./pages/NotificationsPage";
import SettingsPage from "./pages/SettingsPage";
import AssignmentDetailPage from "./components/features/classroom/assignment/AssignmentDetailPage";
import QuizDetailPage from "./pages/QuizDetailPage";
import AnalyticsPage from "./pages/AnalyticsPage";

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
            element={<SignUpPage />}
          />
          <Route
            path="sign-in"
            element={<SignInPage />}
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
              path="/profile"
              element={<ProfilePage />}
            />
            <Route
              path="/classes"
              element={<ClassesPage />}
            />
            <Route
              path="/classroom/:classroomId"
              element={<ClassroomPage />}
            />
            <Route
              path="/classrooms/:classroomId/assignments/:assignmentId"
              element={<AssignmentDetailPage />}
            />
            <Route
              path="/classrooms/:classroomId/quizzes/:quizId"
              element={<QuizDetailPage />}
            />
            <Route
              path="/classroom/:classroomId/analytics"
              element={<AnalyticsPage />}
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
