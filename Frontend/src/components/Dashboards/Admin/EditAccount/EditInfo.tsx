import React, { useState, useEffect } from "react";
import axios from "axios";
import { Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";

interface Profile {
  username: string;
  email: string;
}

interface Props {
  setError: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditInfo: React.FC<Props> = ({ setError }) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get("http://localhost:8787/profile", {
          withCredentials: true,
        });
        if (response.data.success) {
          setProfile(response.data.profile);
        }
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setError(true);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!profile) {
      setIsFormValid(false);
      return;
    }
    const emailPattern = /^[a-z0-9._%+\-]+@[a-z0-9.\-]+\.[a-z]{2,}$/;
    const emailChanged = !!email && email !== profile.email;
    const usernameChanged = !!username && username !== profile.username;
    const emailIsValid = emailChanged ? emailPattern.test(email) : false;
    const usernameIsValid = usernameChanged ? username.length > 0 : false;
    setIsEmailValid(emailPattern.test(email));
    setIsFormValid(
      Boolean(emailChanged && emailIsValid) ||
        Boolean(usernameChanged && usernameIsValid)
    );
  }, [email, username, profile]);

  const updateAccount = async () => {
    setSubmitting(true);
    try {
      const hasUsernameChanged = username && username !== profile?.username;
      const hasEmailChanged = email && email !== profile?.email;

      const response = await axios.post(
        "http://localhost:8787/profile/update",
        {
          username: hasUsernameChanged ? username : undefined,
          email: hasEmailChanged ? email : undefined,
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        messageApi.open({
          type: "success",
          content: "Account updated successfully!",
        });
      }
    } catch (error) {
      messageApi.open({
        type: "error",
        content: "Failed to update account. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {contextHolder}
      {profile ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateAccount();
          }}
          className="p-8 w-full md:max-w-md xl:max-w-lg space-y-2 border-0 py-8"
        >
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-slate-700 font-medium mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username || profile?.username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-400 text-slate-800 bg-slate-50"
                placeholder="Enter your username"
              />
            </div>

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
                value={email || profile?.email}
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
              "Save Profile"
            )}
          </Button>
        </form>
      ) : (
        <div>loading...</div>
      )}
    </>
  );
};

export default EditInfo;
