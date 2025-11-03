import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "@/assets/logo.png";
import axios from "axios";
import { logout } from "../pages/StudentDashboard/SidebarIcons";
import { Button } from "@/components/ui/button";

const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [roleRoute, setRoleRoute] = useState<string>("");

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8787/verify-session",
          {
            withCredentials: true,
          }
        );
        setIsLoggedIn(response.data.success);
        const role: string = response.data.role.toLowerCase();
        const route: string = "/" + role;
        setRoleRoute(route);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    verifySession();
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8787/logout",
        {},
        { withCredentials: true }
      );
      setIsLoggedIn(false);
      navigate("/");
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  if (isLoggedIn === null) {
    return <div className="text-center mt-20">Loading...</div>;
  }

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-[100rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <div className="flex items-center">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center space-x-3 hover:cursor-pointer"
            >
              <img
                src={Logo}
                alt="EventHub Logo"
                className="w-10 h-10 transform transition-all duration-300 hover:scale-110 hover:rotate-3 hover:drop-shadow-lg cursor-pointer"
              />
              <h1 className="text-2xl font-bold text-slate-800 font-poppins">
                EventHub
              </h1>
            </Link>
          </div>
          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                to="/"
                className={` px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/"
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                Home
              </Link>
              <Link
                to="/events"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === "/events"
                    ? "text-blue-600"
                    : "text-slate-600 hover:text-blue-600"
                }`}
              >
                Events
              </Link>
              <Link
                to="/about"
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
          <div>
            {isLoggedIn ? (
              <span className="flex items-center space-x-4">
                <Link
                  to={roleRoute}
                  className="rounded-md px-3 py-2 text-sm text-blue-600 hover:bg-slate-200 font-medium transition-all duration-200 hover:cursor-pointer"
                >
                  Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 rounded-md px-3 py-2 text-sm text-red-500 hover:bg-slate-200 font-medium transition-all duration-200 hover:cursor-pointer"
                >
                  {logout}
                  <span>Logout</span>
                </button>
              </span>
            ) : (
              <div className="flex space-x-4">
                <Link to="/login">
                  <Button
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[80px] border-0"
                  >
                    Login
                  </Button>
                </Link>
                <Link to="/signup">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white hover:bg-slate-100 text-blue-600 font-semibold py-3 px-4 rounded-lg border-2 border-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 min-w-[80px]"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
