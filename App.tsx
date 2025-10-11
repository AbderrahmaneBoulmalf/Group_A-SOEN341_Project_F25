import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Events from "./pages/Events";
import React from "react";
import AboutUs from "./pages/AboutUs";
import ContactUs from "./pages/ContactUs";
import ProtectedRoutes from "./Protected/ProtectedRoutes";
import Unauthorized from "./Protected/Unauthorized";
import Layout from "./pages/StudentDashboard/Layout";
import SavedEvents from "./components/Dashboards/Student/Elements/SavedEvents";
import Calendar from "./components/Dashboards/Student/Elements/Calendar";
import Tickets from "./components/Dashboards/Student/Elements/Tickets";
import Settings from "./components/Dashboards/Student/Elements/Settings";
import Register from "./pages/Register";
import EventDetails from "./pages/EventDetails";
import QRcodeGen from "./pages/StudentDashboard/QRCodeGen";
import QRReader from "./pages/QRReader";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Register />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/qrcode" element={<QRcodeGen />} />
        <Route path="/qrreader" element={<QRReader />} />
        <Route element={<ProtectedRoutes />}>
          {/* <Route path="/admin" element={} />
          <Route path="/manager" element={} /> */}
          <Route path="student" element={<Layout />}>
            <Route index element={<SavedEvents />} />
            <Route path="saved-events" element={<SavedEvents />} />
            <Route path="calendar" element={<Calendar />} />
            <Route path="tickets" element={<Tickets />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
      </Routes>
    </Router>
  );
};

export default App;
