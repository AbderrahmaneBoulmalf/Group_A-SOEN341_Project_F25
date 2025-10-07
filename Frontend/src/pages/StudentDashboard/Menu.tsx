import React from "react";
import { useLocation } from "react-router-dom";

interface textMapType {
  title: string;
  text: string;
}

const Menu: React.FC = () => {
  const location = useLocation();
  const path = location.pathname.toLocaleLowerCase();
  const textMap: { [key: string]: textMapType } = {
    "/test/calendar": {
      title: "Welcome Back",
      text: "Here's a quick overview of your upcoming events and activities.",
    },
    "/test/saved-events": {
      title: "My Saved Events",
      text: "Manage your saved events and access them quickly here.",
    },
    "/test": {
      title: "My Saved Events",
      text: "Manage your saved events and access them quickly here.",
    },
    "/test/tickets": {
      title: "My Tickets",
      text: "Access and manage your event tickets in one place.",
    },
    "/test/settings": {
      title: "Settings",
      text: "Update your personal information and account settings.",
    },
  };
  const title: textMapType = textMap[path] || "Page Not Found";

  return (
    <div className="ml-4 mr-4 mt-4">
      <div className="flex items-center justify-between p-4 pb-6">
        <div className="flex flex-col gap-y-2">
          <p className="mb-1 text-2xl font-bold text-black">{title.title}</p>
          <p className="text text-gray-800">{title.text}</p>
        </div>
      </div>
    </div>
  );
};
export default Menu;
