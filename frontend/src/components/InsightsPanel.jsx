import { useState, useEffect } from "react";

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

function InsightsPanel() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => { fetchInsights(); }, []);

  const fetchInsights = async () => {
    try {
      const res = await authFetch("http://localhost:5000/api/insights");
      if (!res) return;
      const json = await res.json();
      setData(json.insights);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 mb-5 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="h-4 bg-gray-100 rounded w-24" />
        <div className="h-4 bg-gray-100 rounded w-32" />
      </div>
    </div>
  );

  if (!data) return (
    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 mb-5">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
          <span className="text-white text-xs">⚡</span>
        </div>
        <span className="text-sm font-semibold text-gray-700">AI Insights</span>
        <span className="ml-auto text-xs text-gray-400">Add tasks and complete an interview to see insights</span>
      </div>
    </div>
  );

  const readinessColor = {
    "High 🟢": "text-emerald-600 bg-emerald-50 ring-1 ring-emerald-200",
    "Medium 🟡": "text-amber-600 bg-amber-50 ring-1 ring-amber-200",
    "Low 🔴": "text-red-600 bg-red-50 ring-1 ring-red-200",
  };

  // max 3 insights visible, max 2 suggestions
  const visibleInsights = expanded ? data.insights : data.insights.slice(0, 3);
  const visibleSuggestions = data.suggestions.slice(0, 2);

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-white border border-indigo-100 rounded-2xl p-4 mb-5">

      {/* Header row */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs">⚡</span>
        </div>
        <span className="font-semibold text-gray-800 text-sm">AI Insights</span>

        {/* Inline stats */}
        <div className="flex gap-3 ml-2">
          <span className="text-xs font-bold text-indigo-600">{data.stats.completionRate}% done</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs font-bold text-orange-500">{data.stats.streak} 🔥</span>
          <span className="text-xs text-gray-300">·</span>
          <span className="text-xs font-bold text-blue-600">
            {data.stats.lastInterviewScore
              ? `${data.stats.lastInterviewScore}/10 last score`
              : "No interview yet"}
          </span>
        </div>

        {/* Readiness */}
        <span className={`ml-auto text-xs font-semibold px-2.5 py-0.5 rounded-full flex-shrink-0 ${readinessColor[data.stats.readiness] || "text-gray-600 bg-gray-50 ring-1 ring-gray-200"}`}>
          {data.stats.readiness}
        </span>
      </div>

      {/* Insights as compact pills */}
      {visibleInsights.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2.5">
          {visibleInsights.map((insight, i) => (
            <span key={i} className="text-xs text-gray-600 bg-white rounded-lg px-2.5 py-1 border border-gray-100 leading-relaxed">
              {insight}
            </span>
          ))}
          {data.insights.length > 3 && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs text-indigo-500 hover:text-indigo-700 px-2 py-1 font-medium transition-colors"
            >
              {expanded ? "Show less ↑" : `+${data.insights.length - 3} more ↓`}
            </button>
          )}
        </div>
      )}

      {/* Max 2 suggestions */}
      {visibleSuggestions.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {visibleSuggestions.map((s, i) => (
            <span key={i} className="text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-full font-medium">
              → {s}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default InsightsPanel;