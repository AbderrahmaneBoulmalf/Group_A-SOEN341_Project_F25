import React, { useState } from "react";
import axios from "axios";
import { Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";

const UpdatePassword: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [submittingPassword, setSubmittingPassword] = useState<boolean>(false);
  const passwordFormValid =
    currentPassword && newPassword && newPassword === confirmPassword;
  const [messageApi, contextHolder] = message.useMessage();

  const changePassword = async () => {
    setSubmittingPassword(true);
    try {
      const response = await axios.post(
        "http://localhost:8787/profile/changePassword",
        {
          currentPassword,
          newPassword,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        messageApi.open({
          type: "success",
          content: "Password changed successfully!",
        });
        setCurrentPassword("");
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
      <form
        onSubmit={(e) => {
          e.preventDefault();
          changePassword();
        }}
        className="p-8 w-full md:max-w-md xl:max-w-lg space-y-2 border-0 py-8"
      >
        <div className="space-y-4">
          <div>
            <label
              htmlFor="currentPassword"
              className="block text-slate-700 font-medium mb-1"
            >
              Current Password
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
              placeholder="Enter your current password"
            />
          </div>

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
    </>
  );
};

export default UpdatePassword;
