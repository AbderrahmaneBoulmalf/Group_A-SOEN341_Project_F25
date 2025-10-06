import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { message } from "antd";
import Navbar from "@/components/navbar";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

function Register() {
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isPswValid, setPswValid] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const timerRef = React.useRef<number | null>(null);

  const [messageApi, contextHolder] = message.useMessage();
  const success = () => {
    messageApi.open({ type: "success", content: "Register successful!" });
  };

  // validations
  useEffect(() => {
    setIsEmailValid(EMAIL_REGEX.test(email));
  }, [email]);

  useEffect(() => {
    setPswValid(PASSWORD_REGEX.test(password) && password === confirmPassword);
  }, [password, confirmPassword]);

  useEffect(() => {
    setIsFormValid(isEmailValid && isPswValid && username.trim().length > 0);
  }, [isEmailValid, isPswValid, username]);

  // cleanup mock timer
  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  // Backend stuff from login.tsx
  const signUp = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    timerRef.current = window.setTimeout(() => {
      setSubmitting(false);
      success();
    }, 1000);
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />

        {/* Centered card container */}
        <div className="mx-auto max-w-md px-4 py-10">
          <div className="rounded-2xl bg-white shadow-xl ring-1 ring-black/5">
            <div className="p-8 sm:p-10">
              <h1 className="text-center text-3xl font-extrabold text-slate-800">
                Create your account
              </h1>

              <form onSubmit={signUp} className="mt-8 space-y-6">
                {/* Username */}
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Username
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your username"
                  />
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`mt-2 w-full rounded-lg border px-4 py-3 text-slate-800 outline-none focus:ring-2 bg-slate-50 ${
                      email
                        ? isEmailValid
                          ? "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                          : "border-red-500 focus:border-red-500 focus:ring-red-300"
                        : "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                    }`}
                    placeholder="Enter your email"
                  />
                  {!isEmailValid && email.length > 0 && (
                    <p className="mt-1 text-sm text-red-500">
                      Please enter a valid email address.
                    </p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`mt-2 w-full rounded-lg border px-4 py-3 text-slate-800 outline-none focus:ring-2 bg-yellow-50 ${
                      password
                        ? PASSWORD_REGEX.test(password)
                          ? "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                          : "border-red-500 focus:border-red-500 focus:ring-red-300"
                        : "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                    }`}
                    placeholder="Enter a password"
                  />
                  <p
                    className={`mt-1 text-sm ${
                      PASSWORD_REGEX.test(password)
                        ? "text-slate-500"
                        : "text-red-500"
                    }`}
                  >
                    Must be at least 8 characters long and include at least one
                    number.
                  </p>
                </div>

                {/* Confirm Password */}
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-slate-700"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`mt-2 w-full rounded-lg border px-4 py-3 text-slate-800 outline-none focus:ring-2 bg-yellow-50 ${
                      confirmPassword
                        ? password === confirmPassword
                          ? "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                          : "border-red-500 focus:border-red-500 focus:ring-red-300"
                        : "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                    }`}
                    placeholder="Confirm your password"
                  />
                  {confirmPassword && password !== confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">
                      Passwords do not match.
                    </p>
                  )}
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={!isFormValid || submitting}
                  className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting ? "Registering..." : "Create Account"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Register;
