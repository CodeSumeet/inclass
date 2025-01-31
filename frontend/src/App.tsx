import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import SigninPage from "./pages/SigninPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardPage from "./pages/DashboardPage";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<LandingPage />}
          />
          <Route
            path="/auth/sign-up"
            element={<SignupPage />}
          />
          <Route
            path="/auth/sign-in"
            element={<SigninPage />}
          />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/dashboard"
              element={<DashboardPage />}
            />
          </Route>
          <Route
            path="*"
            element={<h1>404 - Page Not Found</h1>}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
