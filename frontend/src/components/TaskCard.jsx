function TaskCard({ task, onToggle, onDelete }) {
  const priorityLeft = {
    High: "border-l-red-400",
    Medium: "border-l-amber-400",
    Low: "border-l-emerald-400",
  };

  const priorityBadge = {
    High: "bg-red-50 text-red-600 ring-1 ring-red-200",
    Medium: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
    Low: "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200",
  };

  const catColors = [
    "bg-indigo-50 text-indigo-600 ring-1 ring-indigo-200",
    "bg-blue-50 text-blue-600 ring-1 ring-blue-200",
    "bg-teal-50 text-teal-600 ring-1 ring-teal-200",
    "bg-orange-50 text-orange-600 ring-1 ring-orange-200",
    "bg-pink-50 text-pink-600 ring-1 ring-pink-200",
    "bg-purple-50 text-purple-600 ring-1 ring-purple-200",
  ];

  const getCatColor = (cat) => {
    const index = Math.abs(cat.split("").reduce((a, c) => a + c.charCodeAt(0), 0)) % catColors.length;
    return catColors[index];
  };

  const isOverdue = task.dueDate && !task.done && new Date(task.dueDate) < new Date();

  return (
    <div className={`border-l-4 ${priorityLeft[task.priority] || "border-l-gray-300"}
      bg-white rounded-2xl px-4 py-3.5 mb-2 flex items-center gap-4
      hover:shadow-sm transition-all duration-150 group border border-gray-100
      ${task.done ? "opacity-60" : ""}`}
    >
      {/* Checkbox */}
      <button
        onClick={onToggle}
        className={`w-5 h-5 rounded-lg border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          task.done
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-gray-300 hover:border-indigo-500"
        }`}
      >
        {task.done && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${task.done ? "line-through text-gray-400" : "text-gray-800"}`}>
          {task.text}
        </p>
        <div className="flex gap-1.5 mt-1.5 flex-wrap items-center">
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${getCatColor(task.category)}`}>
            {task.category}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${priorityBadge[task.priority]}`}>
            {task.priority}
          </span>
          {task.dueDate && (
            <span className={`text-xs px-2 py-0.5 rounded-md font-medium ${
              isOverdue ? "bg-red-50 text-red-500 ring-1 ring-red-200" : "bg-gray-50 text-gray-400"
            }`}>
              {isOverdue ? "⚠ Overdue · " : ""}
              {new Date(task.dueDate).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>

      {/* Delete on hover */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all p-1 rounded-lg hover:bg-red-50"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}

export default TaskCard;