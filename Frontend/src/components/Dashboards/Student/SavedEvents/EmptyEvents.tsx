import React from "react";
import { Empty } from "antd";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const EmptyEvents: React.FC = () => {
  return (
    <div className="relative flex flex-col items-center justify-center min-h-[70vh] text-center overflow-hidden w-[60%]">
      <svg
        className="absolute top-20 left-40 w-24 h-24 text-purple-300 opacity-50"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <circle cx="50" cy="50" r="50" />
      </svg>

      <svg
        className="absolute bottom-20 right-60 w-16 h-16 text-blue-300 opacity-50 rotate-12"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <rect width="100" height="100" rx="8" />
      </svg>

      <svg
        className="absolute top-1/3 right-1/3 w-12 h-12 text-pink-300 opacity-50 rotate-45"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <polygon points="50,0 100,100 0,100" />
      </svg>

      <svg
        className="absolute top-10 right-20 w-20 h-20 text-indigo-300 opacity-40"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <circle cx="50" cy="50" r="50" />
      </svg>

      <svg
        className="absolute bottom-10 left-32 w-16 h-16 text-pink-400 opacity-40 rotate-6"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <polygon points="50,0 100,100 0,100" />
      </svg>

      <svg
        className="absolute top-1/4 left-1/3 w-10 h-10 text-blue-400 opacity-40 rotate-45"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <rect width="100" height="100" rx="12" />
      </svg>

      <svg
        className="absolute bottom-1/3 right-1/4 w-24 h-24 text-purple-400 opacity-40 -rotate-12"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <circle cx="50" cy="50" r="50" />
      </svg>

      <svg
        className="absolute top-2/3 left-1/4 w-12 h-12 text-indigo-400 opacity-40 rotate-12"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <polygon points="50,0 100,100 0,100" />
      </svg>

      <div className="z-10 flex items-center justify-center p-20 shadow-md rounded-3xl border border-gray-200 bg-white/60 backdrop-blur-sm">
        <Empty
          description={
            <p className="text-gray-900 text-xl font-semibold">
              You’ll see your favorite events here once you save them!
            </p>
          }
          styles={{ image: { height: 190 } }}
        >
          <Link to="/events">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-[200px] border-0"
            >
              Search for Events
            </Button>
          </Link>
        </Empty>
      </div>
    </div>
  );
};

export default EmptyEvents;
