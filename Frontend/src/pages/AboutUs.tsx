import React from "react";
import Navbar from "@/components/navbar"; // use your existing navbar

const AboutUs: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 text-slate-800">
      <Navbar />

      <section className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-10">
          About EventHub
        </h1>

        <p className="text-lg text-center mb-10 leading-relaxed">
          EventHub is a centralized platform designed to simplify event
          management and participation for students, organizers, and
          administrators. It allows users to discover, register, and manage
          events seamlessly within their academic community.
        </p>

        <div className="grid md:grid-cols-2 gap-10 mb-12">
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Our Mission
            </h2>
            <p className="text-slate-700 leading-relaxed">
              To empower students and event organizers through a streamlined
              digital experience, connecting people and fostering community
              engagement on campus.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-semibold text-blue-700 mb-4">
              Key Features
            </h2>
            <ul className="list-disc list-inside space-y-2 text-slate-700">
              <li>Event discovery and registration</li>
              <li>Role-based dashboards for users</li>
              <li>Real-time updates and notifications</li>
              <li>Secure login and account management</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
