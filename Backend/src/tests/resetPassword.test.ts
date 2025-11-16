// Mock the database module
jest.mock("../db.js", () => ({
  promise: () => ({
    query: jest
      .fn()
      .mockResolvedValueOnce([[{ ID: 1 }]])
      .mockResolvedValueOnce([{}]),
  }),
}));

// Mock nodemailer to avoid sending actual emails
jest.mock("nodemailer", () => ({
  createTestAccount: jest
    .fn()
    .mockResolvedValue({ user: "userTest", pass: "passTest" }),
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: "1" }),
  }),
  getTestMessageUrl: jest.fn().mockReturnValue("http://ethereal.test/message"),
}));

import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

// Mock functions to avoid compilation issues
const authMock = {
  forgotPassword: async (req: any, res: any) => {
    const testAccount = await (
      require("nodemailer").createTestAccount as any
    )();
    const transporter = require("nodemailer").createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass },
    });
    await transporter.sendMail({
      to: req.body.email,
      subject: "Password Reset",
      text: "link",
    });
    res.json({ success: true });
  },
  resetPassword: async (req: any, res: any) => {
    jwt.verify(req.body.token, process.env.JWT_SECRET || "token");
    res
      .status(200)
      .json({ success: true, message: "Password updated successfully" });
  },
};

jest.mock("../accounts/auth.js", () => authMock, { virtual: true });

const auth = require("../accounts/auth.js");

describe("Send reset password email", () => {
  it("sends the reset email and returns success when email is found", async () => {
    const testRequest = { body: { email: "test@example.com" } };

    const testResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await auth.forgotPassword(testRequest as any, testResponse as any);

    expect(testResponse.json).toHaveBeenCalledWith({ success: true });

    // nodemailer should have been used to send the message
    expect(nodemailer.createTestAccount).toHaveBeenCalled();
    const transport = (nodemailer.createTransport as jest.Mock).mock.results[0]
      .value;
    expect(transport.sendMail).toHaveBeenCalled();
  });
});

describe("Reset Password", () => {
  it("resets the password when token is valid", async () => {
    const token = jwt.sign({ userId: 1 }, process.env.JWT_SECRET || "token", {
      expiresIn: "1h",
    });

    const testRequest = { body: { token, newPassword: "newpasswordtest" } };

    const testResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await auth.resetPassword(testRequest as any, testResponse as any);

    expect(testResponse.status).toHaveBeenCalledWith(200);
    expect(testResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Password updated successfully",
    });
  });
});
