import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  calendar,
  saved,
  settings,
  ticket,
  avatar,
  logout,
} from "./SidebarIcons";
import { Modal, ConfigProvider, Popover } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import Logo from "@/assets/logo.png";
import axios from "axios";

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState<boolean>(false);
  const [username, setUsername] = useState<string>("Username");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await axios.get("http://localhost:8787/user", {
          withCredentials: true,
        });
        if (response.data.success) {
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    fetchUsername();
  }, []);

  const logOut = async () => {
    // Clear login state for homepage
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("role");
    try {
      const response = await axios.post(
        "http://localhost:8787/logout",
        {},
        { withCredentials: true }
      );
      if (response.data.success) {
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Still navigate home even if backend fails
      navigate("/");
    }
  };

  const showModal = () => {
    setOpen(true);
  };

  const hideModal = () => {
    setOpen(false);
  };

  return (
    <div className="w-52 lg:w-64">
      <div className="w-52 lg:w-64 fixed flex min-h-screen flex-col bg-white/80 backdrop-blur-md p-4 text-white text-sm">
        <div className="flex items-center space-x-3 p-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-bold text-white">
            {avatar}
          </div>
          <div>
            <h4 className="font-semibold text-black text-md">{username}</h4>
            <h6 className="text-xs text-gray-700">Student Account</h6>
          </div>
        </div>
        <ul className="mt-6 grow list-none text-black">
          <li className="mb-2 text-sm text-gray-800">Events</li>
          <Link to="/student/calendar">
            <li
              id="overview-list"
              className={`mb-1 flex cursor-pointer items-center space-x-3 rounded-lg p-2 ${
                location.pathname.toLowerCase() === "/student/calendar"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-[#E5E5E5]"
              }`}
            >
              {calendar}
              <p>&nbsp;Calendar</p>
            </li>
          </Link>
          <Link to="/student/saved-events">
            <li
              id="overiew-list"
              className={`mb-1 flex cursor-pointer items-center space-x-3 rounded-lg p-2 ${
                location.pathname.toLowerCase() === "/student/saved-events"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-[#E5E5E5]"
              }`}
            >
              {saved}
              <p>&nbsp;Saved Events</p>
            </li>
          </Link>
          <Link to="/student/tickets">
            <li
              id="overiew-list"
              className={`mb-1 flex cursor-pointer items-center space-x-3 rounded-lg p-2 ${
                location.pathname.toLowerCase() === "/student/tickets"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-[#E5E5E5]"
              }`}
            >
              {ticket}
              <p>&nbsp;Tickets</p>
            </li>
          </Link>
          <li className="mb-2 text-sm text-gray-800">Account</li>
          <Link to="/student/settings">
            <li
              id="overiew-list"
              className={`mb-1 flex cursor-pointer items-center space-x-3 rounded-lg p-2 ${
                location.pathname.toLowerCase() === "/student/settings"
                  ? "bg-blue-600 text-white"
                  : "hover:bg-[#E5E5E5]"
              }`}
            >
              {settings}
              <p>&nbsp;Settings</p>
            </li>
          </Link>
          <br />
          <br /> <br />
          <ConfigProvider
            theme={{
              components: {
                Modal: {
                  colorIcon: "white",
                  colorIconHover: "gray",
                  contentBg: "#E5E5E5 ",
                  headerBg: "#E5E5E5 ",
                },
              },
            }}
          >
            <Modal
              title={
                <p className="flex items-center pb-6 text-black">
                  <ExclamationCircleOutlined
                    className="text-orange-300"
                    style={{ fontSize: "20px" }}
                  />
                  &nbsp; You are about to log out
                </p>
              }
              open={open}
              onOk={logOut}
              onCancel={hideModal}
              okText="Log out"
              cancelText="Cancel"
              okButtonProps={{ style: { backgroundColor: "#ef4444" } }}
              cancelButtonProps={{
                style: {
                  border: "none",
                  color: "#000000",
                },
              }}
            />
          </ConfigProvider>
          <li
            className="flex cursor-pointer items-center space-x-3 rounded-lg p-2 text-red-500 hover:bg-[#E5E5E5]"
            onClick={() => {
              showModal();
            }}
          >
            {logout}
            <p>&nbsp;Log out</p>
          </li>
        </ul>
        <div className="flex items-center text-blue-600">
          <div className="flex grow items-center gap-2 p-2 pb-0 pl-1">
            <Popover
              content={<p className="text-white">Home</p>}
              placement="top"
              color="#155dfc"
            >
              <Link to="/">
                <img src={Logo} alt="icon" className="h-10 lg:h-12" />
              </Link>
            </Popover>
            <div>
              <h4 className="text-md text-black">EventHub</h4>
              <h6 className="text-xs text-slate-700">ver. beta</h6>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
