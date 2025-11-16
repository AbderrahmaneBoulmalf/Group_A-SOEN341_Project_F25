import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LoadingOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import axios from "axios";

interface Props {
  switchToLogin: () => void;
  messageApi: any;
}

const ForgotPassword: React.FC<Props> = ({ switchToLogin, messageApi }) => {
  const [email, setEmail] = useState<string>("");
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const sendEmail = async () => {
    try {
      setSubmitting(true);
      await axios.post("http://localhost:8787/auth/forgot-password", { email });
      success();
      switchToLogin();
    } catch (error) {
      showError();
    } finally {
      setSubmitting(false);
    }
  };

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Password reset link sent successfully!",
    });
  };

  const showError = () => {
    messageApi.open({
      type: "error",
      content: "Failed to send password reset link. Please try again.",
    });
  };

  useEffect(() => {
    const emailPattern = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;
    setIsEmailValid(emailPattern.test(email));
  }, [email]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        sendEmail();
      }}
      className="bg-white rounded-xl shadow-lg p-10 w-full md:max-w-md xl:max-w-lg space-y-5 border-0 py-10"
    >
      <h2 className="text-3xl font-bold text-slate-800 mb-4 text-center font-poppins">
        Forgot Password
      </h2>
      <p>
        Please enter your email address to receive a password reset link. An
        email will be sent to you if a corresponding account is found.
      </p>
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
      <Button
        type="submit"
        size="lg"
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px] w-full border-0"
        disabled={!isEmailValid || submitting}
      >
        {submitting ? (
          <Spin
            indicator={<LoadingOutlined spin style={{ color: "gray" }} />}
            size="default"
          />
        ) : (
          "Send Reset Link"
        )}
      </Button>
      <div className="w-full flex justify-center mt-4">
        <button
          type="button"
          className="text-normal text-blue-600 hover:cursor-pointer mb-2 transition-colors duration-200 hover:text-blue-500"
          onClick={switchToLogin}
        >
          Login
        </button>
      </div>
    </form>
  );
};

export default ForgotPassword;
