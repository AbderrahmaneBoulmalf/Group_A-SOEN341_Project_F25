import React, { useState } from "react";
import Navbar from "@/components/navbar";
import LoginPageForm from "./LoginPageForm";
import ForgotPasswordForm from "./ForgotPasswordForm";
import { message } from "antd";

const Login: React.FC = () => {
  const [whichForm, setWhichForm] = useState<"login" | "forgotPassword">(
    "login"
  );
  const [messageApi, contextHolder] = message.useMessage();

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          {whichForm === "login" ? (
            <LoginPageForm
              switchToForgotPassword={() => setWhichForm("forgotPassword")}
              messageApi={messageApi}
            />
          ) : (
            <ForgotPasswordForm
              switchToLogin={() => setWhichForm("login")}
              messageApi={messageApi}
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Login;
