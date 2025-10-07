import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Events from "./pages/Events";
import React from "react";
import ProtectedRoutes from "./Protected/ProtectedRoutes";
import Unauthorized from "./Protected/Unauthorized";
import Layout from "./pages/StudentDashboard/Layout";
import SavedEvents from "./components/Dashboards/Student/Elements/SavedEvents";
import Calendar from "./components/Dashboards/Student/Elements/Calendar";
import Tickets from "./components/Dashboards/Student/Elements/Tickets";
import Settings from "./components/Dashboards/Student/Elements/Settings";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/events" element={<Events />} />
        <Route element={<ProtectedRoutes />}>
          {/* <Route path="/admin" element={} />
          <Route path="/manager" element={} /> */}
          <Route path="/student" element={<div>Student Dashboard</div>} />
        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />
        {/* Just for testing the layout. Will move it under protected routes after being able to create accounts */}
        <Route path="test" element={<Layout />}>
          <Route index element={<SavedEvents />} />
          <Route path="saved-events" element={<SavedEvents />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;
