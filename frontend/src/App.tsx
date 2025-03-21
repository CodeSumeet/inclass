import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import SignUpPage from "./pages/SignupPage";
import SignInPage from "./pages/SigninPage";
import { ProtectedRoute } from "./components";
import AppLayout from "./layouts/AppLayout";
import ProfilePage from "./pages/ProfilePage";
import ClassesPage from "./pages/ClassesPage";
import ClassroomPage from "./pages/ClassroomPage";
import AssignmentDetailPage from "./components/features/classroom/assignment/AssignmentDetailPage";
import QuizDetailPage from "./pages/QuizDetailPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import VideoConferencePage from "./pages/VideoConferencePage";
import AssignmentEditPage from "./pages/AssignmentEditPage";
import { Toaster } from "sonner";

function App() {
  return (
    <div>
      <Toaster />
      <Router>
        <Routes>
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

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
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
                path="classrooms/:classroomId/assignments/edit/:assignmentId"
                element={<AssignmentEditPage />}
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
                path="/meeting/:meetingId"
                element={<VideoConferencePage />}
              />
            </Route>
          </Route>

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
    </div>
  );
}

export default App;
