
import type { RouteObject } from "react-router-dom";

import AdminLayout     from "../pages/AdminDashboard/Layout";
import Home            from "../pages/AdminDashboard/Home";
import ApprovalsPage   from "../pages/AdminDashboard/ApprovalsPage";
import EventsPage      from "../pages/AdminDashboard/EventsPage";
import AnalyticsPage   from "../pages/AdminDashboard/AnalyticsPage";
import OrgsRolesPage   from "../pages/AdminDashboard/OrgsRolesPage";
import SettingsPage    from "../pages/AdminDashboard/SettingsPage";

export const adminRoutes: RouteObject = {
  path: "/admin",
  element: <AdminLayout />,
  children: [
    { index: true, element: <Home /> },
    { path: "approvals",  element: <ApprovalsPage /> },
    { path: "events",     element: <EventsPage /> },
    { path: "analytics",  element: <AnalyticsPage /> },
    { path: "orgs-roles", element: <OrgsRolesPage /> },
    { path: "settings",   element: <SettingsPage /> },
  ],
};
