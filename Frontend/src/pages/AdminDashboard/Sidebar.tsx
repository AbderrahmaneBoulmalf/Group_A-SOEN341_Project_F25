import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  home,
  settings,
  ApprovalsIcon,
  EventsIcon,
  OrgsRolesIcon,
  AnalyticsIcon,
  logout,
} from "./SidebarIcons";
import logo from "@/assets/logo.png";

type Item = { to: string; label: string; icon: React.ReactNode };

const NavItem: React.FC<Item> = ({ to, label, icon }) => {
  const { pathname } = useLocation();
  const active = pathname.toLowerCase() === to.toLowerCase();

  return (
    <Link to={to}>
      <li
        className={`mb-1 flex items-center gap-3 rounded-lg p-2 text-sm transition ${
          active ||
          (pathname.toLowerCase() === "/admin" && to === "/admin/approvals")
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-[#E5E5E5]"
        }`}
      >
        <span className="shrink-0">{icon}</span>
        <span>{label}</span>
      </li>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } finally {
      navigate("/login");
    }
  };

  const navTop: Item[] = [{ to: "/", label: "Home", icon: home }];

  const navManage: Item[] = [
    { to: "/admin/approvals", label: "Approvals", icon: ApprovalsIcon },
    { to: "/admin/events", label: "Events", icon: EventsIcon },
    {
      to: "/admin/orgs-roles",
      label: "Organizations & Roles",
      icon: OrgsRolesIcon,
    },
  ];

  const navInsights: Item[] = [
    { to: "/admin/analytics", label: "Analytics", icon: AnalyticsIcon },
  ];

  const navAccount: Item[] = [
    { to: "/admin/settings", label: "Settings", icon: settings },
  ];

  return (
    <div className="w-52 lg:w-64">
      <aside className="fixed w-52 lg:w-64 min-h-screen bg-white/80 backdrop-blur-md p-4 flex flex-col text-sm">
        <div className="flex items-center gap-3 p-2">
          <div className="h-10 w-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
            A
          </div>
          <div>
            <h4 className="font-semibold text-black text-sm">Admin</h4>
            <h6 className="text-xs text-gray-600">Administrator</h6>
          </div>
        </div>

        <ul className="mt-6 grow list-none">
          <li className="mb-2 text-xs text-gray-500">Navigation</li>
          {navTop.map((it) => (
            <NavItem key={it.to} {...it} />
          ))}

          <li className="mb-2 mt-4 text-xs text-gray-500">Management</li>
          {navManage.map((it) => (
            <NavItem key={it.to} {...it} />
          ))}

          <li className="mb-2 mt-4 text-xs text-gray-500">Insights</li>
          {navInsights.map((it) => (
            <NavItem key={it.to} {...it} />
          ))}

          <li className="mb-2 mt-4 text-xs text-gray-500">Account</li>
          {navAccount.map((it) => (
            <NavItem key={it.to} {...it} />
          ))}
        </ul>

        <button
          onClick={handleLogout}
          className="mt-2 mb-3 flex items-center gap-3 rounded-lg p-2 text-sm text-red-600 hover:bg-red-50 transition"
        >
          <span className="shrink-0">{logout}</span>
          <span>Log out</span>
        </button>

        <Link
          to="/"
          className="flex items-center gap-2 p-2 text-xs text-gray-600"
        >
          <img src={logo} alt="EventHub" className="h-5 w-5" />
          <span>EventHub • admin</span>
        </Link>
      </aside>
    </div>
  );
};

export default Sidebar;
