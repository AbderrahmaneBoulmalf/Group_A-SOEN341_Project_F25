import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Menu from "./Menu";

const AdminLayout: React.FC = () => {
  return (
    <div className="h-screen w-full overflow-auto bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="flex h-full w-full">
        <Sidebar />
        <div className="h-full flex-1">
          <div className="flex h-full flex-col">
            <Menu />
            <div className="flex-grow">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;
