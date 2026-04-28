import { Link, useLocation } from "react-router-dom";

function Navbar() {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const links = [
    { path: "/", label: "Tasks", icon: "▦" },
    { path: "/planner", label: "Planner", icon: "◈" },
    { path: "/interview", label: "Interview", icon: "◎" },
    { path: "/history", label: "History", icon: "◷" },
    { path: "/resume", label: "Resume", icon: "◻" },
    { path: "/doubt", label: "Doubt", icon: "◇" },
  ];

  return (
    <aside
      style={{ width: "208px" }}
      className="fixed top-0 left-0 h-screen bg-white border-r border-gray-100 flex flex-col z-50"
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-black">AI</span>
          </div>
          <div className="min-w-0">
            <p className="text-gray-900 font-bold text-sm leading-tight truncate">Prep Copilot</p>
            <p className="text-gray-400 text-xs truncate">placement assistant</p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {links.map(link => {
          const active = location.pathname === link.path;
          return (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              <span className={`text-base flex-shrink-0 ${active ? "text-white" : "text-gray-400"}`}>
                {link.icon}
              </span>
              <span className="truncate">{link.label}</span>
              {active && <span className="ml-auto w-1.5 h-1.5 bg-white rounded-full opacity-70 flex-shrink-0" />}
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-50 mb-2">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {(user.name || "U")[0].toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-800 text-xs font-semibold truncate">{user.name || "User"}</p>
            <p className="text-gray-400 text-xs truncate">{user.email || ""}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all font-medium"
        >
          <span>⎋</span>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}

export default Navbar;