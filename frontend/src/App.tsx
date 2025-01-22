import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route
            path="/"
            element={<LandingPage />}
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
