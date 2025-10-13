import React, { useEffect, useRef, useState } from "react";
import { BrowserQRCodeReader } from "@zxing/browser";
import Navbar from "@/components/navbar";

// - Upload a QR image file (screenshot/photo).
// - Decode the QR from the image (client-side).
// - Verify the decoded passId with backend.

//To be used with backend verification in the future
type VerifyResponse = {
  ok: boolean;
  userId?: string;
  eventId?: string;
  error?: string;
};

export default function QRFromImagePreviewPage() {
  const fileRef = useRef<HTMLInputElement | null>(null); // file input ref

  // Preview + decode state
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [decoded, setDecoded] = useState<string>(""); // hidden from UI
  const [decodeError, setDecodeError] = useState<string>("");

  // Verify state
  const [verifying, setVerifying] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState<string>("");

  // Revoke previous object URL when it changes or on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  //Function called when user picks a file
  async function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    setDecodeError("");
    setVerifyMsg("");
    setDecoded("");

    const file = e.target.files?.[0];
    if (!file) return;

    //Create a URL for the uploaded image
    const url = URL.createObjectURL(file);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return url;
    });

    //Decode the QR from that image URL (silently—no text shown on the page)
    try {
      const reader = new BrowserQRCodeReader();
      const res = await reader.decodeFromImageUrl(url); // throws if not found/decodable
      setDecoded(res.getText()); //sets the decoded text
    } catch (err: any) {
      setDecodeError(err?.message ?? "Could not decode QR from image.");
    }
  }

  //Function to verify the passId with backend
  async function verifyPass() {
    if (!decoded) return; //if nothing decoded, do nothing
    setVerifying(true);
    setVerifyMsg("");

    try {
      //Backend verification - to be done in future
      /*
      async function verify(passId: string): Promise<VerifyResponse> {
        const res = await fetch("/verifyQRCode", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ passId }),
        });
        return res.json() as Promise<VerifyResponse>;
      }*/

      // Simulate network delay and response, can delete after backend is ready
      await new Promise((r) => setTimeout(r, 350));
      const data: VerifyResponse = await new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({ ok: true, userId: "u_demo_123", eventId: "e_demo_456" }),
          350
        )
      );

      // Show result
      if (data.ok) {
        setVerifyMsg("✅ Pass verified. Access granted.");
      } else {
        setVerifyMsg(
          `❌ Verification failed: ${data.error ?? "unknown error"}`
        );
      }
    } catch {
      setVerifyMsg("❌ Verification error.");
    } finally {
      setVerifying(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f9ff]">
      <Navbar />

      {/* Top */}
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
