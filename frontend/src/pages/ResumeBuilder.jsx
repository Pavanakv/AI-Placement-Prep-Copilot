import { useState } from "react";

// Fix #10 — safe auth fetch
const authFetch = async (url, options = {}) => {
  const token = localStorage.getItem("token");
  if (!token) { window.location.href = "/login"; return null; }
  const res = await fetch(url, {
    ...options,
    headers: { ...options.headers, Authorization: `Bearer ${token}` }
  });
  if (res.status === 401) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
    return null;
  }
  return res;
};

function ResumeBuilder() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const maxChars = 1000;

  const improveResume = async () => {
    // Fix #8 — validate empty + whitespace input
    if (!input.trim()) { alert("Please enter your project description"); return; }
    if (input.trim().length < 20) { alert("Please enter a more detailed description (at least 20 characters)"); return; }

    setLoading(true);
    setResult("");
    const res = await authFetch("http://localhost:5000/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "resume", input }),
    });
    if (!res) return;
    const data = await res.json();
    setResult(data.result);
    setLoading(false);
  };

  const copyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tips = [
    "Use strong action verbs: Built, Designed, Implemented, Optimized",
    "Include measurable impact: Reduced load time by 40%",
    "Mention tech stack: React, Node.js, MongoDB",
    "Add team context: Led a team of 3 to deliver...",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Resume Optimizer</h1>
          <p className="text-gray-400 text-sm mt-0.5">Transform your project descriptions with AI-powered impact statements</p>
        </div>

        {/* Tips */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-6">
          <p className="text-xs font-semibold text-indigo-700 mb-2">💡 What makes a great resume bullet?</p>
          <div className="grid grid-cols-2 gap-2">
            {tips.map((tip, i) => (
              <p key={i} className="text-xs text-indigo-600 flex gap-1.5">
                <span className="flex-shrink-0">→</span>{tip}
              </p>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Your Description</p>
              {/* Fix #8 — show character count */}
              <span className={`text-xs font-medium ${input.length > maxChars ? "text-red-500" : "text-gray-400"}`}>
                {input.length}/{maxChars}
              </span>
            </div>
            <textarea
              rows={10}
              maxLength={maxChars}
              placeholder={`Paste your project description here...\n\nExample:\nMade a website for a client using React. It had login and dashboard features.`}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
            />
            <button onClick={improveResume} disabled={loading || !input.trim() || input.trim().length < 20}
              className="w-full mt-3 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-60">
              {loading ? "✨ Improving..." : "✨ Improve with AI"}
            </button>
            {input.trim().length > 0 && input.trim().length < 20 && (
              <p className="text-xs text-amber-500 mt-2 text-center">Add more detail for better results</p>
            )}
          </div>

          {/* Output */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex justify-between items-center mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">AI Improved Version</p>
              {result && (
                <button onClick={copyResult}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-medium bg-indigo-50 px-2.5 py-1 rounded-lg transition-all">
                  {copied ? "✓ Copied!" : "Copy"}
                </button>
              )}
            </div>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1,2,3,4,5,6].map(i => (
                  <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: `${60 + i * 6}%` }} />
                ))}
              </div>
            ) : result ? (
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 h-56 overflow-y-auto">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{result}</pre>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-center">
                <div>
                  <p className="text-3xl mb-2">✨</p>
                  <p className="text-gray-400 text-sm">AI-improved version will appear here</p>
                  <p className="text-gray-300 text-xs mt-1">Enter your description and click improve</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResumeBuilder;