import type { Request, Response } from "express";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import nodemailer from "nodemailer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const isEmailValid = (email: unknown): email is string => {
  if (typeof email !== "string") return false;
  const trimmed = email.trim();
  if (!trimmed) return false;
  const emailPattern = /^[\w.!#$%&'*+/=?`{|}~-]+@[\w-]+(?:\.[\w-]+)+$/i;
  return emailPattern.test(trimmed);
};

const isNonEmptyString = (value: unknown): value is string => {
  return typeof value === "string" && value.trim().length > 0;
};

const sendContactMessage = async (req: Request, res: Response): Promise<void> => {
  const { name, email, message } = req.body ?? {};

  if (!isNonEmptyString(name) || !isEmailValid(email) || !isNonEmptyString(message)) {
    res.status(400).json({ success: false, message: "Name, email, and message are required" });
    return;
  }

  const receiverEmail = process.env.CONTACT_RECEIVER_EMAIL || process.env.EMAIL_USER;

  if (!receiverEmail) {
    res.status(500).json({ success: false, message: "Contact email is not configured" });
    return;
  }

  if (!process.env.EMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    res.status(500).json({ success: false, message: "Email sender is not configured" });
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const senderName = name.trim();
    const senderEmail = (email as string).trim().toLowerCase();
    const submittedAt = new Date().toISOString();

    await transporter.sendMail({
      from: `"EventHub" <${process.env.EMAIL_USER}>`,
      to: receiverEmail,
      replyTo: senderEmail,
      subject: `New contact request from ${senderName}`,
      text: [
        `You received a new contact us submission on ${submittedAt}.`,
        "",
        `Name: ${senderName}`,
        `Email: ${senderEmail}`,
        "",
        "Message:",
        message.trim(),
      ].join("\n"),
    });

    res.status(200).json({ success: true, message: "Message sent" });
  } catch (error) {
    console.error("Error sending contact message:", error);
    res.status(500).json({ success: false, message: "Failed to send message" });
  }
};

const contactController = {
  sendContactMessage,
};

export default contactController;
