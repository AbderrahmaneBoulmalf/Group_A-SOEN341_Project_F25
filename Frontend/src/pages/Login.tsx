import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import Navbar from "@/components/navbar";

const Login: React.FC = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);

  const login = () => {
    setSubmitting(true);
    // Handle login logic here
    //Mock login delay
    setTimeout(() => {
      setSubmitting(false);
      success();
    }, 1000);
  };

  const [messageApi, contextHolder] = message.useMessage();

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Login successful!",
    });
  };

  useEffect(() => {
    const emailPattern = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;
    setIsEmailValid(emailPattern.test(email));
    if (password && isEmailValid) {
      setIsFormValid(emailPattern.test(email));
    } else {
      setIsFormValid(false);
    }
  }, [email, password]);

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <Navbar />
        {/* Login Form */}
        <div className="flex items-center justify-center flex-grow">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              login();
            }}
            className="bg-white rounded-xl shadow-lg p-10 w-full md:max-w-md xl:max-w-lg space-y-8 border-0 py-10"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center font-poppins">
              Login to EventHub
            </h2>
            <div className="space-y-0">
              <div>
                <label
                  htmlFor="email"
                  className="block text-slate-700 font-medium mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                  placeholder="Enter your email"
                />
                <p
                  className={`mb-1 mt-2 w-full text-left text-xs text-red-500 ${
                    isEmailValid ? "invisible" : email ? "visible" : "invisible"
                  }`}
                >
                  Please enter a valid email address
                </p>
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-slate-700 font-medium mb-1"
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            <Button
              type="submit"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px] w-full border-0"
              disabled={!isFormValid || submitting}
            >
              {submitting ? (
                <Spin
                  indicator={<LoadingOutlined spin style={{ color: "gray" }} />}
                  size="default"
                />
              ) : (
                "Login"
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;
