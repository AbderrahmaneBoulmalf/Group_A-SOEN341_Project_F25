import React from "react";
import { Link, useLocation } from "react-router-dom";
import Logo from "@/assets/logo.png";

const Navbar: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                to="/#events"
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Events
              </Link>
              <Link
                to="/#about"
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                About
              </Link>
              <Link
                to="/#features"
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Features
              </Link>
              <Link
                to="/#contact"
                className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
