import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import SignupPage from "./pages/SignupPage";
import SigninPage from "./pages/SigninPage";

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
        </Routes>
      </Router>
    </div>
  );
}

export default App;
