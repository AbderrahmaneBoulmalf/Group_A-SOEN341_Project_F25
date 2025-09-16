import React from "react";

const Home: React.FC = () => {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-300">
      <div className="border-2 border-gray-400 rounded-lg p-8 bg-white text-center">
        <h1 className="text-4xl font-bold">Project Init</h1>
        <p className="mt-4 text-lg">SOEN 341</p>
      </div>
    </div>
  );
};

export default Home;
