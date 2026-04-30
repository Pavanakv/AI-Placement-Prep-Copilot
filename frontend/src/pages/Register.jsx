import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_BASE } from "../config";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    if (!name || !email || !password) { setError("Please fill all fields"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/");
      } else { setError(data.message || "Registration failed"); }
    } catch { setError("Something went wrong. Try again."); }
    setLoading(false);
  };

  // Fix #11 — Enter key on all fields
  const handleKey = (e) => { if (e.key === "Enter") handleRegister(); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex w-1/2 bg-indigo-600 flex-col justify-between p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center">
            <span className="text-indigo-600 font-black text-sm">AI</span>
          </div>
          <span className="text-white font-bold text-lg">Prep Copilot</span>
        </div>
        <div>
          <h1 className="text-4xl font-black text-white leading-tight mb-4">
            Start your placement<br />journey today
          </h1>
          <p className="text-indigo-200 text-lg leading-relaxed mb-8">
            Join students using AI to crack their dream placements faster and smarter.
          </p>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Mock Interviews", desc: "Voice-powered AI interviewer" },
              { label: "Smart Planner", desc: "Day-wise personalized plan" },
              { label: "AI Insights", desc: "Know your weak areas" },
              { label: "Resume Builder", desc: "AI-improved descriptions" },
            ].map(f => (
              <div key={f.label} className="bg-indigo-500/40 rounded-xl p-3">
                <p className="text-white font-semibold text-sm">{f.label}</p>
                <p className="text-indigo-200 text-xs mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-indigo-300 text-sm">Free to use. No credit card required.</p>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900">Create your account</h2>
            <p className="text-gray-500 mt-1 text-sm">Get started with your placement prep</p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input
                placeholder="Alex Johnson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKey}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKey}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input
                type="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKey}
                className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-200 disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
            </button>
          </div>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;