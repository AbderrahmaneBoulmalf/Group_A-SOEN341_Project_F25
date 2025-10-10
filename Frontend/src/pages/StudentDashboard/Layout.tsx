import React, { useEffect } from "react";
// import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
import Menu from "./Menu";


const Layout: React.FC = () => {
  useEffect(() => {
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("role", "student");
  }, []);

  //   const location = useLocation();
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

export default Layout;
