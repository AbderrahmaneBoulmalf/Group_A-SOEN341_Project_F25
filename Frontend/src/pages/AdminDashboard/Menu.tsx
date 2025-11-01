import React from "react";
import { useLocation } from "react-router-dom";

type TextMap = { title: string; text: string };

const Menu: React.FC = () => {
  const path = useLocation().pathname.toLowerCase();

  const textMap: Record<string, TextMap> = {
    "/admin": {
      title: "Approvals",
      text: "Review and approve organizer accounts and event submissions.",
    },
    "/admin/approvals": {
      title: "Approvals",
      text: "Review and approve organizer accounts and event submissions.",
    },
    "/admin/moderation": {
      title: "Moderation",
      text: "Moderate, edit or remove event listings that violate guidelines.",
    },
    "/admin/analytics": {
      title: "Analytics",
      text: "View platform metrics, growth and engagement.",
    },
    "/admin/orgs-roles": {
      title: "Organizations & Roles",
      text: "Moderate organizational accounts and manage user roles.",
    },
    "/admin/settings": {
      title: "Settings",
      text: "Configure admin account and platform settings.",
    },
  };

  const header = textMap[path] ?? { title: "Admin", text: "" };

  return (
    <div className="ml-4 mr-4 mt-4">
      <div className="flex items-center justify-between p-4 pb-6">
        <div className="flex flex-col gap-y-2">
          <p className="mb-1 text-2xl font-bold text-black">{header.title}</p>
          <p className="text text-gray-800">{header.text}</p>
        </div>
      </div>
    </div>
  );
};

export default Menu;
