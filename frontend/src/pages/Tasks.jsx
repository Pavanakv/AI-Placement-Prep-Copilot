import { useState, useEffect } from "react";
import TaskCard from "../components/TaskCard";
import InsightsPanel from "../components/InsightsPanel";
import { API_BASE } from "../config";

// Fix #10 — safe auth fetch, never sends "Bearer null"
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

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [input, setInput] = useState("");
  const [category, setCategory] = useState("DSA");
  const [priority, setPriority] = useState("Medium");
  const [dueDate, setDueDate] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  const fetchTasks = async () => {
    setFetching(true);
    const res = await authFetch(`${API_BASE}/api/tasks`);
    if (!res) return;
    const data = await res.json();
    const sorted = (data.tasks || []).sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (!a.dueDate && !b.dueDate) return 0;
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
    setTasks(sorted);
    setFetching(false);
  };

  const addTask = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const res = await authFetch("${API_BASE}/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input, category, priority, dueDate })
    });
    if (!res) return;
    const data = await res.json();
    setTasks(prev => [data.task, ...prev]);
    setInput(""); setDueDate("");
    setLoading(false);
  };

  const toggleTask = async (id) => {
    const res = await authFetch(`${API_BASE}/api/tasks/${id}/toggle`, { method: "PATCH" });
    if (!res) return;
    const data = await res.json();
    setTasks(prev => prev.map(t => t._id === id ? data.task : t));
  };

  const deleteTask = async (id) => {
    await authFetch(`${API_BASE}/api/tasks/${id}`, { method: "DELETE" });
    setTasks(prev => prev.filter(t => t._id !== id));
  };

  const clearAllTasks = async () => {
    // Fix #12 — double confirm to prevent accidental clear
    if (!window.confirm("Delete ALL tasks? This cannot be undone!")) return;
    await authFetch(`${API_BASE}/api/tasks`, { method: "DELETE" });
    setTasks([]);
  };

  const getStreak = () => {
    const dates = tasks.filter(t => t.done).map(t => new Date(t.updatedAt).toDateString());
    const uniqueDates = [...new Set(dates)];
    let streak = 0;
    let current = new Date();
    for (let i = 0; i < 30; i++) {
      if (uniqueDates.includes(current.toDateString())) { streak++; current.setDate(current.getDate() - 1); }
      else break;
    }
    return streak;
  };

  const streak = getStreak();
  const total = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const pending = total - completed;
  const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
  const today = new Date().toDateString();
  const completedToday = tasks.filter(t => t.done && new Date(t.updatedAt).toDateString() === today).length;

  const uniqueCategories = [...new Set(tasks.map(t => t.category))];
  const barColors = ["bg-indigo-500","bg-blue-500","bg-teal-500","bg-orange-500","bg-pink-500","bg-purple-500","bg-red-500"];
  const categoryStats = uniqueCategories.map((cat, i) => ({
    label: cat,
    count: tasks.filter(t => t.category === cat).length,
    done: tasks.filter(t => t.category === cat && t.done).length,
    color: barColors[i % barColors.length]
  }));

  const filteredTasks = tasks
    .filter(t => filter === "All" ? true : t.category === filter)
    .filter(t => t.text.toLowerCase().includes(search.toLowerCase()));

  const defaultCats = ["DSA","Resume","Project","Interview","SQL","Python","Statistics","React","Node.js","System Design","General"];
  const extraCats = uniqueCategories.filter(c => !defaultCats.includes(c));
  const pendingTasks = filteredTasks.filter(t => !t.done);
  const completedTasks = filteredTasks.filter(t => t.done);

  // Fix #4 — correct stat cards, no duplicate streak value
  const statCards = [
    { label: "Total", value: total, color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
    { label: "Completed", value: completed, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
    { label: "Pending", value: pending, color: "text-red-500", bg: "bg-red-50 border-red-100" },
    { label: "Today", value: completedToday, color: "text-orange-500", bg: "bg-orange-50 border-orange-100" },
    { label: "Streak", value: `${streak} 🔥`, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Learning Progress</h1>
            <p className="text-gray-400 text-sm mt-0.5">Track and manage your placement prep tasks</p>
          </div>
          {/* Fix #12 — moved clear all away from main actions, smaller + less prominent */}
          <button onClick={clearAllTasks}
            className="text-xs text-gray-300 hover:text-red-400 px-3 py-1.5 rounded-lg hover:bg-red-50 transition-all border border-gray-100 hover:border-red-200">
            Clear All
          </button>
        </div>

        {/* AI Insights */}
        <InsightsPanel />

        {/* Stat Cards — Fix #4 */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {statCards.map((s) => (
            <div key={s.label} className={`${s.bg} border rounded-2xl p-3.5 text-center`}>
              <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-gray-400 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-indigo-600">{completionRate}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5">
            <div className="bg-indigo-600 h-2.5 rounded-full transition-all duration-700"
              style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Category Breakdown */}
        {categoryStats.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
            {categoryStats.map((cat) => {
              const rate = cat.count === 0 ? 0 : Math.round((cat.done / cat.count) * 100);
              return (
                <div key={cat.label} className="bg-white rounded-2xl p-3.5 border border-gray-100 shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-gray-600 truncate">{cat.label}</span>
                    <span className="text-xs text-gray-400 ml-1">{cat.done}/{cat.count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className={`${cat.color} h-1.5 rounded-full`} style={{ width: `${rate}%` }} />
                  </div>
                  <p className="text-xs text-gray-400 mt-1.5">{rate}% done</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Task */}
        <div className="bg-white rounded-2xl p-4 mb-5 border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">New Task</p>
          <div className="flex flex-wrap gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)}
              placeholder="What do you need to do?"
              onKeyDown={(e) => e.key === "Enter" && addTask()}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent min-w-40" />
            <select value={category} onChange={(e) => setCategory(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              {[...defaultCats, ...extraCats].map(c => <option key={c}>{c}</option>)}
            </select>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>High</option><option>Medium</option><option>Low</option>
            </select>
            <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            <button onClick={addTask} disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-200 disabled:opacity-50">
              {loading ? "..." : "+ Add"}
            </button>
          </div>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 mb-5">
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks..."
            className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
            <option>All</option>
            {uniqueCategories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        {/* Task List */}
        {fetching ? (
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-16 animate-pulse border border-gray-100" />
            ))}
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-gray-400 text-sm font-medium">No tasks found</p>
            <p className="text-gray-300 text-xs mt-1">Add your first task above to get started!</p>
          </div>
        ) : (
          <div>
            {pendingTasks.length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 px-1">
                  Pending · {pendingTasks.length}
                </p>
                {pendingTasks.map(task => (
                  <TaskCard key={task._id} task={task}
                    onToggle={() => toggleTask(task._id)}
                    onDelete={() => deleteTask(task._id)} />
                ))}
              </div>
            )}
            {completedTasks.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2 px-1">
                  Completed · {completedTasks.length}
                </p>
                {completedTasks.map(task => (
                  <TaskCard key={task._id} task={task}
                    onToggle={() => toggleTask(task._id)}
                    onDelete={() => deleteTask(task._id)} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Tasks;