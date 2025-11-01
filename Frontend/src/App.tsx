import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from "react";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";

import ProtectedRoutes from "./Protected/ProtectedRoutes";
import Unauthorized from "./Protected/Unauthorized";

// Student
import Layout from "./pages/StudentDashboard/Layout";
import SavedEvents from "./components/Dashboards/Student/Elements/SavedEvents";
import Calendar from "./components/Dashboards/Student/Elements/Calendar";
import Tickets from "./components/Dashboards/Student/Elements/Tickets";
import Settings from "./components/Dashboards/Student/Elements/Settings";
import QRCodeGen from "./pages/StudentDashboard/QRCodeGen";
import QRCodeReader from "./pages/QRReader";
import Payment from "@/pages/Payment";

// Manager
import ManagerLayout from "./pages/EventsDashboard/Layout";
import MyEvents from "./components/Dashboards/Manager/Elements/MyEvents";
import CreateEvents from "./components/Dashboards/Manager/Elements/CreateEvents";
import ManagerSettings from "./components/Dashboards/Manager/Elements/Settings";
import EventAnalytics from "./components/Dashboards/Manager/Elements/EventAnalytics";

// Admin
import AdminLayout from "./pages/AdminDashboard/Layout";
import AdminHome from "./pages/AdminDashboard/Home";
import ApprovalsPage from "./pages/AdminDashboard/ApprovalsPage";
import ModerationPage from "./pages/AdminDashboard/ModerationPage";
import AnalyticsPage from "./pages/AdminDashboard/AnalyticsPage";
import OrgsRolesPage from "./pages/AdminDashboard/OrgsRolesPage";
import AdminSettings from "./pages/AdminDashboard/SettingsPage";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="qr/:eventId" element={<QRCodeGen />} />
        <Route path="qrreader" element={<QRCodeReader />} />
        <Route path="/payment" element={<Payment />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoutes role="admin" />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<ApprovalsPage />} />
            <Route path="approvals" element={<ApprovalsPage />} />
            <Route path="moderation" element={<ModerationPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="orgs-roles" element={<OrgsRolesPage />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        {/* Protected Manager Routes */}
        <Route element={<ProtectedRoutes role="manager" />}>
          <Route path="manager" element={<ManagerLayout />}>
            <Route index element={<MyEvents />} />
            <Route path="my-events" element={<MyEvents />} />
            <Route path="create-events" element={<CreateEvents />} />
            <Route path="settings" element={<ManagerSettings />} />
            <Route path="event/:id" element={<EventAnalytics />} />
          </Route>
        </Route>

        {/* Protected Student Routes */}
        <Route element={<ProtectedRoutes role="student" />}>
          <Route path="student" element={<Layout />}>
            <Route index element={<SavedEvents />} />
            <Route path="saved-events" element={<SavedEvents />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Unauthorized Route */}
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
};

export default App;
