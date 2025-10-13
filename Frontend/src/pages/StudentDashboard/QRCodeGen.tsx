import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { QRCode } from "antd";
import axios from "axios";
import Navbar from "@/components/navbar";

type IssuePassResponse = { passId: string; expiresAt?: string };

export default function PassQRPage() {
  const { eventId } = useParams<{ eventId: string }>();

  const [passId, setPassId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrContainerRef = useRef<HTMLDivElement | null>(null);

  // Call the backend to issue a pass for the current user + this event
  async function generatePass() {
    if (!eventId) {
      setError("Missing event id in URL.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const { data } = await axios.post<IssuePassResponse>(
        "http://localhost:8787/student/issue-pass",
        { eventId }, // only send eventId; backend reads userId from session
        {
          withCredentials: true,
          headers: { "Content-Type": "application/json" },
        }
      );
      setPassId(data.passId);
    } catch (e: any) {
      setPassId("");
      setError(e?.response?.data?.error || e.message || "Failed to issue pass");
    } finally {
      setGenerating(false);
    }
  }

  // Download the QR code as PNG
  function handleDownloadPng() {
    const canvas = qrContainerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = passId ? `pass_${passId}.png` : "pass_qr.png";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f9ff]">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <section className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Generate Your <span className="text-[#2b6ef5]">Event Pass</span>
            </h1>
          </div>

          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md ring-1 ring-black/5 p-6 md:p-8">
            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <button
                type="button"
                onClick={generatePass}
                disabled={generating || !eventId}
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-white bg-[#2b6ef5] hover:bg-[#1f5be0] disabled:opacity-60 shadow-sm"
                title={!eventId ? "No event id in URL" : "Issue a new pass"}
              >
                {generating ? "Generating…" : "Generate Pass"}
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={!passId}
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 border border-[#2b6ef5] text-[#2b6ef5] hover:bg-[#eaf1ff] disabled:opacity-60"
              >
                Download PNG
              </button>
            </div>

            {/* QR display */}
            <div className="flex flex-col items-center gap-3">
              <div
                ref={qrContainerRef}
                className="bg-white p-4 rounded-xl border"
              >
                {passId ? (
                  <QRCode
                    value={passId}
                    size={240}
                    color="#000"
                    bgColor="#fff"
                  />
                ) : (
                  <div className="w-[240px] h-[240px] flex items-center justify-center text-gray-400">
                    No pass yet
                  </div>
                )}
              </div>

              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3 w-full text-center">
                  {error}
                </div>
              )}
            </div>

            {/* Info */}
            {passId && (
              <div className="mt-5 text-center text-gray-700">
                <div className="text-lg md:text-xl font-semibold">
                  Pass Created!
                </div>
                <br />
                <span className="font-medium">Pass ID:</span>{" "}
                <span className="font-mono break-all">{passId}</span>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
