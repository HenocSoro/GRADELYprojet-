/**
 * App Shell — sidebar w-56 avec icônes + labels + topbar.
 */

import { Link, useLocation, Outlet } from "react-router-dom";
import { LayoutDashboard, Bell, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import { logout } from "../../api/auth.js";
import Logo from "../ui/Logo.jsx";

export default function AppShell() {
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [pendingSupervisionCount, setPendingSupervisionCount] = useState(0);

  useEffect(() => {
    api.get("/api/me/").then(({ data }) => {
      setUser(data);
      if (data?.is_staff) {
        api.get("/api/supervision-requests/pending-count/").then(
          (r) => setPendingSupervisionCount(r.data?.count ?? 0)
        ).catch(() => setPendingSupervisionCount(0));
      }
    }).catch(() => setUser(null));
  }, []);

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 sticky top-0 h-screen flex flex-col bg-white border-r border-gray-100">
        {/* Logo */}
        <div className="flex items-center px-4 py-4 border-b border-gray-100">
          <Link to="/dashboard" className="block w-full">
            <Logo variant="sidebar" />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <Link
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(to)
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive(to) ? "text-blue-600" : "text-gray-400"}`} />
              {label}
            </Link>
          ))}

          {user?.is_staff && (
            <Link
              to="/supervision-requests"
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive("/supervision-requests")
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Bell className={`w-4 h-4 shrink-0 ${isActive("/supervision-requests") ? "text-blue-600" : "text-gray-400"}`} />
              Supervision
              {pendingSupervisionCount > 0 && (
                <span className="ml-auto flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-bold text-white">
                  {pendingSupervisionCount > 9 ? "9+" : pendingSupervisionCount}
                </span>
              )}
            </Link>
          )}
        </nav>

        {/* Utilisateur + déconnexion */}
        <div className="border-t border-gray-100 px-3 py-3 space-y-0.5">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs shrink-0">
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </div>
            <span className="text-xs text-gray-500 truncate min-w-0">{user?.email ?? "..."}</span>
          </div>
          <button
            onClick={() => { logout(); window.location.href = "/login"; }}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-colors w-full"
          >
            <LogOut className="w-4 h-4 text-gray-400 shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Zone principale */}
      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}
