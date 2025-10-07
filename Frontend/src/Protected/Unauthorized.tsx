import React from "react";
import unauthorized from "../assets/unauthorized.svg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Unauthorized: React.FC = () => {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-100">
      <img
        src={unauthorized}
        alt="Unauthorized"
        className="h-56 sm:h-56 mb-4"
      />
      <h1 className="text-2xl font-bold text-gray-800">Unauthorized Access</h1>
      <div className="p-2 text-center">
        <p className="text-gray-600 mb-5 mt-2 sm:text-lg">
          You do not have permission to view this page. Please log in to
          continue.
        </p>
      </div>
      <Link to="/login" className="p-2 px-20 sm:px-28 3xl:py-3 3xl:text-lg">
        <Button
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-[200px] border-0"
        >
          Login
        </Button>
      </Link>
    </div>
  );
};

export default Unauthorized;
