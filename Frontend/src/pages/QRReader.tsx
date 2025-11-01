import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import Navbar from "@/components/navbar";
import axios from "axios";

// (Optional) You aren't using this right now, so you can remove it.
// type VerifyResponse = { ok: boolean; userId?: string; eventId?: string; error?: string; passId?: string; };

export default function QRFromImagePreviewPage() {
  const fileRef = useRef<HTMLInputElement | null>(null);

  // Preview + decode state
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [decoded, setDecoded] = useState<string>(""); // hidden from UI
  const [decodeError, setDecodeError] = useState<string>("");

  // Verify state
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string>("");

  // Revoke previous object URL on change/unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  // When user picks a file
  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    setDecodeError("");
    setVerifyMsg("");
    setDecoded("");

    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    try {
      const reader = new BrowserQRCodeReader();
      const res = await reader.decodeFromImageUrl(url); // throws if not decodable
      setDecoded(res.getText());
    } catch (err: any) {
      setDecodeError(err?.message ?? "Could not decode QR from image.");
    }
  }

  // Verify the decoded pass with backend
  async function verifyPass() {
    if (!decoded) return;
    setVerifying(true);
    setVerifyMsg("");

    try {
      // If your QR contains JSON like {"passId": "..."} extract it; else use the raw decoded string
      const passFromQR = decoded;
      const resp = await axios.post(
        "http://localhost:8787/internal/verify",
        { pass: passFromQR },
        { validateStatus: () => true }
      );

      if (resp.status === 200 && resp.data?.valid) {
        setVerifyMsg(`✅ Pass verified. Access granted.`);
      } else if (resp.status === 200 && !resp.data?.valid) {
        setVerifyMsg("❌ Invalid or already used pass.");
      } else if (resp.status === 404 || resp.status === 410) {
        setVerifyMsg("❌ No valid pass found for this code.");
      } else {
        setVerifyMsg(`❌ Verification failed (status ${resp.status}).`);
      }
    } catch (err: any) {
      setVerifyMsg(`❌ Verification error: ${err?.message ?? "unknown"}`);
    } finally {
      setVerifying(false);
    }
  }

  // ---------- Component JSX ----------
  return (
    <div className="min-h-screen flex flex-col bg-[#f6f9ff]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <section className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Scan QR <span className="text-[#2b6ef5]">from Image</span>
            </h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Upload a screenshot/photo of a QR.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md ring-1 ring-black/5 p-6 md:p-8">
            {/* Upload File */}
            <div className="flex flex-col items-center gap-4 mb-6">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={onPickFile}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-white bg-[#2b6ef5] hover:bg-[#1f5be0] shadow-sm"
              >
                Choose Image
              </button>
              <div className="text-xs text-gray-500">PNG, JPG, or WebP.</div>
            </div>

            {/* Display uploaded Image */}
            {previewUrl ? (
              <div className="flex flex-col items-center gap-3 mb-4">
                <img
                  src={previewUrl}
                  alt="Uploaded QR preview"
                  className="max-w-full rounded-xl border"
                  style={{ width: 280 }}
                />
              </div>
            ) : (
              <div className="text-center text-gray-400 mb-4">
                No image uploaded yet.
              </div>
            )}

            {/* Verification */}
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={verifyPass}
                disabled={!decoded || verifying}
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-white bg-[#2b6ef5] hover:bg-[#1f5be0] disabled:opacity-60"
              >
                {verifying ? "Verifying…" : "Verify"}
              </button>
            </div>

            {/* Display Result */}
            {verifyMsg && (
              <div className="mt-4 text-center text-sm bg-gray-50 border rounded-lg p-3">
                {verifyMsg}
              </div>
            )}
            {decodeError && (
              <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                {decodeError}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
