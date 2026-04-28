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

function DoubtSolver() {
  const [question, setQuestion] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const solveDoubt = async () => {
    if (!question.trim()) { alert("Please enter a question"); return; }
    setLoading(true);
    setResult("");
    const res = await authFetch("http://localhost:5000/api/ai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "doubt", input: question }),
    });
    if (!res) return;
    const data = await res.json();
    setResult(data.result);
    setHistory(prev => [{ q: question, a: data.result }, ...prev.slice(0, 4)]);
    setLoading(false);
  };

  const sampleQuestions = [
    "What is the difference between == and === in JavaScript?",
    "Explain Big O notation with examples",
    "How does useEffect work in React?",
    "What is a closure in JavaScript?",
    "Difference between SQL and NoSQL databases?",
    "What is recursion and when to use it?",
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Doubt Solver</h1>
          <p className="text-gray-400 text-sm mt-0.5">Get instant, beginner-friendly explanations for any concept</p>
        </div>

        {/* Ask */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Ask Your Doubt</p>
          <textarea
            rows={4}
            placeholder={`Type your question here...\n\ne.g. What is the difference between let, const and var in JavaScript?`}
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && e.ctrlKey && solveDoubt()}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none mb-3"
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-400">Ctrl+Enter to submit</p>
            <button onClick={solveDoubt} disabled={loading || !question.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-60">
              {loading ? "Thinking..." : "Ask AI →"}
            </button>
          </div>
        </div>

        {/* Sample Questions */}
        {!result && !loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Try These Questions</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {sampleQuestions.map((q, i) => (
                <button key={i} onClick={() => setQuestion(q)}
                  className="text-left text-sm text-gray-600 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-xl px-3 py-2.5 transition-all">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Answer */}
        {(loading || result) && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center text-white text-xs font-bold">AI</div>
              <p className="text-sm font-semibold text-gray-700">AI Explanation</p>
            </div>
            {loading ? (
              <div className="space-y-2 animate-pulse">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-3 bg-gray-100 rounded" style={{ width: `${60 + i * 8}%` }} />
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-4">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 leading-relaxed">{result}</pre>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {history.length > 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Questions</p>
            <div className="space-y-2">
              {history.slice(1).map((item, i) => (
                <button key={i} onClick={() => { setQuestion(item.q); setResult(item.a); }}
                  className="w-full text-left bg-gray-50 hover:bg-indigo-50 border border-gray-100 hover:border-indigo-200 rounded-xl px-3 py-2.5 transition-all">
                  <p className="text-sm text-gray-700 truncate">{item.q}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DoubtSolver;