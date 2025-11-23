import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { message } from "antd";
import axios from "axios";
import { AxiosError } from "axios";
import Navbar from "@/components/navbar";
import { useNavigate } from "react-router-dom";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_REGEX = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [isFormValid, setIsFormValid] = useState<boolean>(false);
  const [isPswValid, setPswValid] = useState<boolean>(false);
  const [isEmailValid, setIsEmailValid] = useState<boolean>(false);
  const [emailTouched, setEmailTouched] = useState<boolean>(false);
  const [passwordTouched, setPasswordTouched] = useState<boolean>(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState<boolean>(false);
  const [showErrors, setShowErrors] = useState<boolean>(false);
  const [accountType, setAccountType] = useState<string>(""); // "" = not selected
  const timerRef = React.useRef<number | null>(null);

  const [messageApi, contextHolder] = message.useMessage();
  const success = () => {
    messageApi.open({ type: "success", content: "Register successful!" });
  };
  const successManager = () => {
    messageApi.open({
      type: "success",
      content: "Pending approval for account creation.",
    });
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

  // submit
  const signUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  setShowErrors(true);
  if (!isFormValid || submitting || !accountType) return;
    setSubmitting(true);
    try {
      const response = await axios.post("http://localhost:8787/register", {
        email,
        password,
        username,
        accountType,
      });
      if (response.data.success) {
        success();
        // Redirect based on account type
        if (accountType === "manager") {
          // For managers, redirect to a page indicating pending approval
          // Do something later
          successManager();
        } else if (accountType === "student") {
          navigate("/login");
        }
      }
    } catch (err) {
      // error handling
      const e = err as AxiosError<{ message?: string }>;
      const msg =
        e.response?.data?.message ||
        e.response?.statusText ||
        e.message ||
        "Registration failed.";
      message.error(msg);
      console.error(e);
    } finally {
      setSubmitting(false);
    }
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
              {accountType && (
                <button
                  type="button"
                  onClick={() => setAccountType("")}
                  className="mb-4 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  ← Back to account type selection
                </button>
              )}
              <h1 className="text-center text-3xl font-extrabold text-slate-800">
                Create your account
              </h1>

              <form onSubmit={signUp} className="mt-8 space-y-6">
                {/* --- Mode select (shown when no accountType yet) --- */}
                {!accountType && (
                  <div>
                    <label
                      htmlFor="accountType"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Choose account type
                    </label>
                    <select
                      id="accountType"
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value)}
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                    >
                      <option value="" disabled>
                        Select type
                      </option>
                      <option value="student">Student</option>
                      <option value="manager">Manager</option>
                    </select>
                  </div>
                )}

                {/* --- Student fields --- */}
                {accountType === "student" && (
                  <>
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
                        onChange={(e) => {
                          if (!emailTouched) setEmailTouched(true);
                          setEmail(e.target.value);
                        }}
                        className={`mt-2 w-full rounded-lg border px-4 py-3 text-slate-800 outline-none focus:ring-2 bg-slate-50 ${
                          (emailTouched || showErrors) && !isEmailValid
                            ? "border-red-500 focus:border-red-500 focus:ring-red-300"
                            : "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                        }`}
                        placeholder="Enter your email"
                      />
                      {(emailTouched || showErrors) && !isEmailValid && (
                        <p className="mt-1 text-sm text-red-500">
                          Please enter a valid email address.
                        </p>
                      )}
                    </div>

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
                        onChange={(e) => {
                          if (!passwordTouched) setPasswordTouched(true);
                          setPassword(e.target.value);
                        }}
                        className={`mt-2 w-full rounded-lg border px-4 py-3 text-slate-800 outline-none focus:ring-2 bg-yellow-50 ${
                          (passwordTouched || showErrors) && !PASSWORD_REGEX.test(password)
                            ? "border-red-500 focus:border-red-500 focus:ring-red-300"
                            : password
                            ? "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                            : "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                        }`}
                        placeholder="Enter a password"
                      />
                      {(passwordTouched || showErrors) && (
                        <p
                          className={`mt-1 text-sm ${
                            PASSWORD_REGEX.test(password)
                              ? "text-slate-500"
                              : "text-red-500"
                          }`}
                        >
                          Must be at least 8 characters long and include at
                          least one number.
                        </p>
                      )}
                    </div>

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
                        onChange={(e) => {
                          if (!confirmPasswordTouched)
                            setConfirmPasswordTouched(true);
                          setConfirmPassword(e.target.value);
                        }}
                        className={`mt-2 w-full rounded-lg border px-4 py-3 text-slate-800 outline-none focus:ring-2 bg-yellow-50 ${
                          (confirmPasswordTouched || showErrors) &&
                          password !== confirmPassword
                            ? "border-red-500 focus:border-red-500 focus:ring-red-300"
                            : confirmPassword
                            ? "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                            : "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                        }`}
                        placeholder="Confirm your password"
                      />
                      {(confirmPasswordTouched || showErrors) &&
                        password !== confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">
                          Passwords do not match.
                        </p>
                        )}
                    </div>
                  </>
                )}

                {/* --- Manager fields --- */}
                {accountType === "manager" && (
                  <>
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-slate-700"
                      >
                        Organization
                      </label>
                      <input
                        id="username"
                        name="username"
                        type="text"
                        autoComplete="organization"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 px-4 py-3 text-slate-800 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400"
                        placeholder="Enter your organization"
                      />
                    </div>

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
                        onChange={(e) => {
                          if (!emailTouched) setEmailTouched(true);
                          setEmail(e.target.value);
                        }}
                        className={`mt-2 w-full rounded-lg border px-4 py-3 text-slate-800 outline-none focus:ring-2 bg-slate-50 ${
                          (emailTouched || showErrors) && !isEmailValid
                            ? "border-red-500 focus:border-red-500 focus:ring-red-300"
                            : "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                        }`}
                        placeholder="Enter your email"
                      />
                      {(emailTouched || showErrors) && !isEmailValid && (
                        <p className="mt-1 text-sm text-red-500">
                          Please enter a valid email address.
                        </p>
                      )}
                    </div>

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
                        onChange={(e) => {
                          if (!passwordTouched) setPasswordTouched(true);
                          setPassword(e.target.value);
                        }}
                        className={`mt-2 w-full rounded-lg border px-4 py-3 text-slate-800 outline-none focus:ring-2 bg-yellow-50 ${
                          (passwordTouched || showErrors) && !PASSWORD_REGEX.test(password)
                            ? "border-red-500 focus:border-red-500 focus:ring-red-300"
                            : password
                            ? "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                            : "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                        }`}
                        placeholder="Enter a password"
                      />
                      {(passwordTouched || showErrors) && (
                        <p
                          className={`mt-1 text-sm ${
                            PASSWORD_REGEX.test(password)
                              ? "text-slate-500"
                              : "text-red-500"
                          }`}
                        >
                          Must be at least 8 characters long and include at
                          least one number.
                        </p>
                      )}
                    </div>

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
                        onChange={(e) => {
                          if (!confirmPasswordTouched)
                            setConfirmPasswordTouched(true);
                          setConfirmPassword(e.target.value);
                        }}
                        className={`mt-2 w-full rounded-lg border px-4 py-3 text-slate-800 outline-none focus:ring-2 bg-yellow-50 ${
                          (confirmPasswordTouched || showErrors) &&
                          password !== confirmPassword
                            ? "border-red-500 focus:border-red-500 focus:ring-red-300"
                            : confirmPassword
                            ? "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                            : "border-slate-300 focus:border-blue-400 focus:ring-blue-400"
                        }`}
                        placeholder="Confirm your password"
                      />
                      {(confirmPasswordTouched || showErrors) &&
                        password !== confirmPassword && (
                        <p className="mt-1 text-sm text-red-500">
                          Passwords do not match.
                        </p>
                        )}
                    </div>
                  </>
                )}

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={!isFormValid || submitting || !accountType}
                  className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-blue-700 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting
                    ? "Registering..."
                    : accountType
                    ? "Create Account"
                    : "Select account type"}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default Register;
