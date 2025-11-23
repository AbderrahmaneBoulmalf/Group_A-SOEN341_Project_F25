import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { message, Spin } from "antd";
import axios from "axios";
import { LoadingOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

interface ResetPasswordFormProps {
  token: string | null;
}

const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ token }) => {
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [submittingPassword, setSubmittingPassword] = useState<boolean>(false);
  const passwordFormValid = newPassword && newPassword === confirmPassword;
  const [messageApi, contextHolder] = message.useMessage();

  const navigate = useNavigate();

  const changePassword = async () => {
    setSubmittingPassword(true);
    try {
      const response = await axios.post(
        "http://localhost:8787/account/resetPassword",
        {
          newPassword,
          token,
        }
      );

      if (response.data.success) {
        messageApi.open({
          type: "success",
          content: "Password changed successfully!",
          duration: 2,
          onClose: () => {
            navigate("/login");
          },
        });
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Failed to change password. Please try again.",
      });
    }
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col">
        <Navbar />
        <div className="flex items-center justify-center flex-grow">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              changePassword();
            }}
            className="bg-white rounded-xl shadow-lg p-10 w-full md:max-w-md xl:max-w-lg space-y-5 border-0 py-10"
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-4 text-center font-poppins">
              Reset Your Password
            </h2>
            <div className="space-y-4 mt-6">
              <div>
                <label
                  htmlFor="newPassword"
                  className="block text-slate-700 font-medium mb-1"
                >
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                  placeholder="Enter a new password"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-slate-700 font-medium mb-1"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                  placeholder="Re-enter new password"
                />
                <p
                  className={`mb-1 mt-2 w-full text-left text-xs text-red-500 ${
                    newPassword === confirmPassword || !confirmPassword
                      ? "invisible"
                      : "visible"
                  }`}
                >
                  Passwords do not match
                </p>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 min-w-[200px] w-full border-0"
              disabled={!passwordFormValid || submittingPassword}
            >
              {submittingPassword ? (
                <Spin
                  indicator={<LoadingOutlined spin style={{ color: "gray" }} />}
                  size="default"
                />
              ) : (
                "Change Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </>
  );
};

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: any }>();

  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    if (!token) {
      navigate("/login");
      console.error("No token found in URL");
      return;
    }

    const verifyToken = async (token: any) => {
      try {
        await axios.post("http://localhost:8787/auth/verify-reset-token", {
          token,
        });
        setLoading(false);
      } catch (error) {
        console.error("Token verification failed:", error);
        alert("Invalid or expired token. Please request a new password reset.");
        navigate("/login");
      }
    };

    verifyToken(token);
  }, []);

  return loading ? (
    <div className="w-full flex items-center justify-center min-h-screen">
      <p className="text-lg text-black">Loading...</p>
    </div>
  ) : (
    <ResetPasswordForm token={token} />
  );
};

export default ResetPassword;
