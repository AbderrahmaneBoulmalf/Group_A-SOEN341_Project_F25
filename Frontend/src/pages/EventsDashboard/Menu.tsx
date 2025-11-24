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
    "/manager/my-events": {
      title: "My Events",
      text: "Here's a quick overview of all your scheduled events.",
    },
    "/manager/create-events": {
      title: "Create Event",
      text: "Add new events and manage your event schedule here.",
    },
    "/manager/settings": {
      title: "Settings",
      text: "Update your personal information and account settings.",
    },
    "/manager": {
      title: "My Events",
      text: "Here's a quick overview of all your scheduled events.",
    },
    "/manager/event/:id": {
      title: "My Events",
      text: "View detailed analytics for this event.",
    },
  };

  // Handle dynamic event analytics route
  const isAnalyticsPage = path.startsWith("/manager/event/");
  const title: textMapType = isAnalyticsPage
    ? {
        title: "My Events",
        text: "View detailed analytics for this event.",
      }
    : textMap[path] || { title: "Page Not Found", text: "" };

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
