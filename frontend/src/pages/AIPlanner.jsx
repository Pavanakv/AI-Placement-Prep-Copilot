import { useState } from "react";
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

function AIPlanner() {
  const [daysLeft, setDaysLeft] = useState("");
  const [hoursPerDay, setHoursPerDay] = useState("");
  const [weakTopics, setWeakTopics] = useState("");
  const [jobRole, setJobRole] = useState("");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const generatePlan = async () => {
    if (!jobRole.trim()) { alert("Please enter your target job role!"); return; }
    if (!daysLeft || daysLeft <= 0) { alert("Please enter valid number of days!"); return; }
    if (!hoursPerDay || hoursPerDay <= 0) { alert("Please enter valid hours per day!"); return; }
    if (daysLeft > 365) { alert("Maximum 365 days allowed!"); return; }
    if (hoursPerDay > 16) { alert("Maximum 16 hours per day allowed!"); return; }

    setLoading(true);
    // Fix #15 — reset saved state when generating new plan
    setSaved(false);
    setPlan(null);

    const input = `Target Job Role: ${jobRole}\nDays left for placement: ${daysLeft}\nAvailable hours per day: ${hoursPerDay}\nWeak topics: ${weakTopics || "Not specified"}`;

    const res = await authFetch(`${API_BASE}/api/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "planner", input })
    });
    if (!res) return;
    const data = await res.json();

    if (typeof data.result === "object" && data.result.days) {
      setPlan(data.result);
    } else {
      setPlan({ raw: typeof data.result === "string" ? data.result : JSON.stringify(data.result) });
    }
    setLoading(false);
  };

  const savePlanToTasks = async () => {
    if (!plan?.days) return;
    if (!window.confirm("This will add tasks to your Task Tracker. Continue?")) return;
    setSaving(true);
    const today = new Date();
    const allTasks = [];
    for (const day of plan.days) {
      const dueDate = new Date(today);
      dueDate.setDate(today.getDate() + day.day - 1);
      const dueDateStr = dueDate.toISOString().split("T")[0];
      for (const taskText of day.tasks) {
        allTasks.push({ text: taskText, category: day.category, priority: "Medium", dueDate: dueDateStr });
      }
    }
    await Promise.all(allTasks.map(task =>
      authFetch(`${API_BASE}/api/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task)
      })
    ));
    setSaving(false);
    setSaved(true);
  };

  const catBorder = {
    SQL: "border-l-blue-400", Python: "border-l-yellow-400", Statistics: "border-l-purple-400",
    Visualization: "border-l-pink-400", Excel: "border-l-green-400", "HTML/CSS": "border-l-orange-400",
    JavaScript: "border-l-yellow-400", React: "border-l-cyan-400", Projects: "border-l-teal-400",
    DSA: "border-l-indigo-400", "Node.js": "border-l-green-400", Databases: "border-l-blue-400",
    "System Design": "border-l-red-400", ML: "border-l-pink-400", Resume: "border-l-orange-400"
  };

  const suggestedRoles = ["Frontend Developer","Backend Developer","Full Stack","Data Analyst","Data Scientist","DevOps","Android Developer","ML Engineer"];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">AI Study Planner</h1>
          <p className="text-gray-400 text-sm mt-0.5">Get a personalized day-wise placement prep roadmap</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Your Details</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Target Job Role *</label>
              <input placeholder="e.g. Data Analyst, Frontend Developer" value={jobRole}
                onChange={(e) => setJobRole(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2" />
              <div className="flex gap-2 flex-wrap">
                {suggestedRoles.map(r => (
                  <button key={r} onClick={() => setJobRole(r)}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                      jobRole === r
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "border-gray-200 text-gray-500 hover:border-indigo-300 hover:text-indigo-600"
                    }`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Days left *</label>
              <input type="number" placeholder="e.g. 30" value={daysLeft}
                onChange={(e) => setDaysLeft(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Hours per day *</label>
              <input type="number" placeholder="e.g. 4" value={hoursPerDay}
                onChange={(e) => setHoursPerDay(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">Weak topics (optional)</label>
              <input placeholder="e.g. SQL joins, React hooks, Dynamic Programming" value={weakTopics}
                onChange={(e) => setWeakTopics(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
          </div>
          <button onClick={generatePlan} disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3.5 rounded-xl font-semibold text-sm transition-all shadow-md shadow-indigo-200 disabled:opacity-60">
            {loading ? "⏳ Generating your plan..." : "🚀 Generate My Plan"}
          </button>
        </div>

        {/* Fix #5 — loading skeleton while plan generates */}
        {loading && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 animate-pulse">
            <div className="h-5 bg-gray-100 rounded w-48 mb-4" />
            <div className="flex gap-2 mb-4">
              {[1,2,3].map(i => <div key={i} className="h-6 bg-gray-100 rounded-full w-20" />)}
            </div>
            {[1,2,3,4,5].map(i => (
              <div key={i} className="bg-gray-50 rounded-xl p-4 mb-3">
                <div className="flex justify-between mb-2">
                  <div className="h-4 bg-gray-100 rounded w-16" />
                  <div className="h-4 bg-gray-100 rounded w-20" />
                </div>
                <div className="h-3 bg-gray-100 rounded w-full mb-1" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            ))}
          </div>
        )}

        {/* Plan display */}
        {!loading && plan?.days && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{plan.days.length}-Day Plan for {plan.role}</h3>
                <div className="flex gap-2 mt-2 flex-wrap">
                  {plan.categories?.map(cat => (
                    <span key={cat} className="text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full font-medium ring-1 ring-indigo-200">{cat}</span>
                  ))}
                </div>
              </div>
              <button onClick={savePlanToTasks} disabled={saving || saved}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex-shrink-0 ml-4 ${
                  saved
                    ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200 cursor-default"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm"
                } disabled:opacity-60`}>
                {saving ? "Saving..." : saved ? "✓ Saved to Tasks!" : "Save to Tasks"}
              </button>
            </div>

            <div className="space-y-3">
              {plan.days.map((day) => {
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + day.day - 1);
                return (
                  <div key={day.day} className={`border-l-4 ${catBorder[day.category] || "border-l-gray-300"} bg-gray-50 rounded-xl p-4`}>
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-400">Day {day.day}</span>
                        <span className="text-xs px-2 py-0.5 bg-white rounded-full text-gray-600 font-medium border border-gray-200">{day.category}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {dueDate.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2 italic">{day.focus}</p>
                    <ul className="space-y-1">
                      {day.tasks.map((task, i) => (
                        <li key={i} className="text-sm text-gray-700 flex gap-2">
                          <span className="text-indigo-400 flex-shrink-0">•</span>{task}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>

            {saved && (
              <div className="mt-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center text-emerald-700 text-sm font-medium">
                ✅ All tasks saved with due dates! Go to Tasks to track progress.
              </div>
            )}
          </div>
        )}

        {/* Fallback plain text */}
        {!loading && plan?.raw && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Your Plan</h3>
            <pre className="whitespace-pre-wrap text-gray-700 text-sm leading-relaxed">{plan.raw}</pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIPlanner;