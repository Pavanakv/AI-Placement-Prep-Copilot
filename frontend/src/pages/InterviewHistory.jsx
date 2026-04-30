import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config";

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

function InterviewHistory() {
  const [interviews, setInterviews] = useState([]);
  const [fetching, setFetching] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchInterviews(); }, []);

  const fetchInterviews = async () => {
    setFetching(true);
    const res = await authFetch(`${API_BASE}/api/interviews`);
    if (!res) return;
    const data = await res.json();
    setInterviews(data.interviews || []);
    setFetching(false);
  };

  const totalInterviews = interviews.length;
  const avgScore = totalInterviews
    ? (interviews.reduce((a, b) => a + b.averageScore, 0) / totalInterviews).toFixed(1)
    : 0;
  const bestScore = totalInterviews
    ? Math.max(...interviews.map(i => i.averageScore)).toFixed(1)
    : 0;
  const recentScore = interviews[0]?.averageScore || 0;

  const getScoreColor = (score) =>
    score >= 7 ? "text-emerald-600" : score >= 5 ? "text-amber-500" : "text-red-500";

  const getScoreBg = (score) =>
    score >= 7 ? "bg-emerald-50 border-emerald-100" : score >= 5 ? "bg-amber-50 border-amber-100" : "bg-red-50 border-red-100";

  const getScoreBar = (score) =>
    score >= 7 ? "bg-emerald-500" : score >= 5 ? "bg-amber-400" : "bg-red-400";

  const getScoreLabel = (score) =>
    score >= 7 ? "Excellent" : score >= 5 ? "Good" : "Needs Work";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Interview History</h1>
            <p className="text-gray-400 text-sm mt-0.5">Track your mock interview performance over time</p>
          </div>
          <button onClick={() => navigate("/interview")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-200">
            + New Interview
          </button>
        </div>

        {/* Stats */}
        {totalInterviews > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Total Sessions", value: totalInterviews, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
              { label: "Average Score", value: `${avgScore}/10`, color: "text-blue-600", bg: "bg-blue-50 border-blue-100" },
              { label: "Best Score", value: `${bestScore}/10`, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
              { label: "Latest Score", value: `${recentScore}/10`, color: getScoreColor(recentScore), bg: getScoreBg(recentScore) },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-2xl p-4 text-center`}>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Fix #14 — only show trend if more than 1 interview */}
        {interviews.length > 1 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Score Trend</p>
            <div className="flex items-end gap-2 h-16">
              {[...interviews].reverse().map((interview, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`w-full rounded-t-lg ${getScoreBar(interview.averageScore)} transition-all`}
                    style={{ height: `${(interview.averageScore / 10) * 56}px`, minHeight: "4px" }}
                  />
                  <span className="text-xs text-gray-400">{interview.averageScore}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-xs text-gray-300">Oldest</span>
              <span className="text-xs text-gray-300">Latest</span>
            </div>
          </div>
        )}

        {/* Interview List */}
        {fetching ? (
          <div className="space-y-3">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-28 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="text-5xl mb-4">🎯</div>
            <h3 className="text-lg font-bold text-gray-700 mb-2">No interviews yet</h3>
            <p className="text-gray-400 text-sm mb-6">Complete your first mock interview to see your results here</p>
            <button onClick={() => navigate("/interview")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-200">
              Start First Interview
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {interviews.map((interview) => (
              <div key={interview._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-gray-800 text-base">{interview.role}</h3>
                      <span className="text-xs px-2 py-0.5 bg-gray-100 rounded-full text-gray-500 font-medium">
                        {interview.level}
                      </span>
                      {interview.focus && (
                        <span className="text-xs px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full border border-indigo-100 font-medium">
                          {interview.focus}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-400 flex-wrap">
                      <span>📅 {new Date(interview.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span className="text-gray-200">·</span>
                      <span>❓ {interview.totalQuestions} questions</span>
                      <span className="text-gray-200">·</span>
                      <span className={`font-semibold ${getScoreColor(interview.averageScore)}`}>
                        {getScoreLabel(interview.averageScore)}
                      </span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <div className={`text-3xl font-black ${getScoreColor(interview.averageScore)}`}>
                      {interview.averageScore}
                      <span className="text-base font-semibold text-gray-300">/10</span>
                    </div>
                  </div>
                </div>

                {/* Score per question */}
                <div className="space-y-1.5">
                  {interview.scores.map((score, j) => (
                    <div key={j} className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-16 flex-shrink-0">Q{j + 1}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${getScoreBar(score)}`}
                          style={{ width: `${score * 10}%` }} />
                      </div>
                      <span className={`text-xs font-bold w-8 text-right ${getScoreColor(score)}`}>
                        {score}/10
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default InterviewHistory;