import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Tasks from "./pages/Tasks";
import AIPlanner from "./pages/AIPlanner";
import MockInterview from "./pages/MockInterview";
import ResumeBuilder from "./pages/ResumeBuilder";
import DoubtSolver from "./pages/DoubtSolver";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InterviewHistory from "./pages/InterviewHistory";

const isLoggedIn = () => !!localStorage.getItem("token");

const ProtectedRoute = ({ children }) => {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  return (
    <div style={{ display: "flex", minHeight: "100vh" }} className="bg-gray-50">
      <Navbar />
      {/* 208px = exact sidebar width */}
      <div style={{ marginLeft: "208px", flex: 1, minWidth: 0 }}>
        {children}
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<ProtectedRoute><Tasks /></ProtectedRoute>} />
        <Route path="/planner" element={<ProtectedRoute><AIPlanner /></ProtectedRoute>} />
        <Route path="/interview" element={<ProtectedRoute><MockInterview /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><InterviewHistory /></ProtectedRoute>} />
        <Route path="/resume" element={<ProtectedRoute><ResumeBuilder /></ProtectedRoute>} />
        <Route path="/doubt" element={<ProtectedRoute><DoubtSolver /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;