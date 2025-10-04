import React from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Logo from "@/assets/logo.png";
import { Link } from "react-router-dom";

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Navigation Header */}
      <nav className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo/Title */}
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center space-x-3">
                <img
                  src={Logo}
                  alt="EventHub Logo"
                  className="w-10 h-10 transform transition-all duration-300 hover:scale-110 hover:rotate-3 hover:drop-shadow-lg cursor-pointer"
                />
                <h1 className="text-2xl font-bold text-slate-800 font-poppins">
                  EventHub
                </h1>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">

                <a
                  href="#events"
                  className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Events 
                </a>
                
                <a
                  href="#about"
                  className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  About
                </a>
                <a
                  href="#features"
                  className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Features
                </a>
                <a
                  href="#contact"
                  className="text-slate-600 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          {/* Main Title */}
          <div className="mb-12">
            <div className="flex justify-center items-center mb-6">
              <img
                src={Logo}
                alt="EventHub Logo"
                className="w-20 h-20 transform transition-all duration-300 hover:scale-110 hover:rotate-3 hover:drop-shadow-xl cursor-pointer"
              />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-slate-800 mb-6 font-poppins">
              Welcome to
              <span className="block text-blue-600">EventHub</span>
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Your comprehensive platform for managing events, connecting
              students, organizers, and administrators in one seamless
              experience.
            </p>
          </div>

          {/* Login/Signup Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Link to="/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-[200px] border-0"
              >
                Login
              </Button>
            </Link>
            <Button
              variant="outline"
              size="lg"
              className="bg-white hover:bg-slate-100 text-blue-600 font-semibold py-3 px-8 rounded-lg border-2 border-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-[200px]"
            >
              Sign Up
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2 text-center">
                For Students
              </h3>
              <p className="text-slate-600 text-center transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer px-2 py-1">
                Discover and join events, track your participation, and connect
                with your community.
              </p>
            </Card>

            <Card className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2 text-center">
                For Organizers
              </h3>
              <p className="text-slate-600 text-center transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer px-2 py-1">
                Create and manage events, track attendance, and engage with your
                audience effectively.
              </p>
            </Card>

            <Card className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-200 border-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-slate-800 mb-2 text-center">
                For Administrators
              </h3>
              <p className="text-slate-600 text-center transition-colors duration-200 hover:text-blue-600 hover:bg-blue-50 rounded-md cursor-pointer px-2 py-1">
                Oversee platform operations, manage users, and ensure smooth
                event coordination.
              </p>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-slate-300">
            © 2024 EventHub - SOEN 341 Project. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Home;

