import React, { useState, useRef } from "react";
import { QRCode } from "antd";
import Navbar from "@/components/navbar";

//Creates a QR code with a opaque (encoded) PassID.
// - User clicks "Generate Pass" button to create a new passId.
// - A QR code is generated encoding that passId.
// - User can download the QR code as PNG.
// - userId and eventId are mocked for now (to be handled server-side later).
// - Server owns userId/eventId; we mock a passId locally for now.
// - QR encodes ONLY the opaque passId.

export default function PassQRPage() {
  const MOCK_USER_ID = "u_demo_123";
  const MOCK_EVENT_ID = "e_demo_456";

  const [passId, setPassId] = useState<string>("");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const qrContainerRef = useRef<HTMLDivElement | null>(null); //QR code container stuff

  //Fallback random ID generator if crypto.randomUUID is unavailable (browser compatibility stuff)
  function fallbackRandomId() {
    return (
      "p_" + Math.random().toString(36).slice(2, 10) + Date.now().toString(36)
    );
  }

  //Generate the PassID
  //We might want to completely gut this and just handle 100% server-side later

  function generatePass() {
    setGenerating(true);
    setError(null);
    try {
      const id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : fallbackRandomId();
      setPassId(id);
    } catch (e: any) {
      setError(e?.message ?? "Failed to generate pass");
      setPassId("");
    } finally {
      setGenerating(false);
    }
  }
  // Download the QR code as PNG
  function handleDownloadPng() {
    const canvas = qrContainerRef.current?.querySelector("canvas");
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    const a = document.createElement("a"); // create a temporary link
    a.href = dataUrl;
    a.download = passId ? `pass_${passId}.png` : "pass_qr.png";
    document.body.appendChild(a); // needed for Firefox
    a.click();
    a.remove(); // cleanup
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f9ff]">
      <Navbar />

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center py-16 px-6">
        <section className="w-full max-w-2xl">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-3">
              Generate Your <span className="text-[#2b6ef5]">Event Pass</span>
            </h1>
            {/* Creates a QR code with a opaque (encoded) PassID. */}
          </div>

          {/* Card */}
          <div className="bg-white/90 backdrop-blur rounded-2xl shadow-md ring-1 ring-black/5 p-6 md:p-8">
            {/* Actions */}
            <div className="flex flex-wrap gap-3 justify-center mb-6">
              <button
                type="button"
                onClick={generatePass}
                disabled={generating}
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-white bg-[#2b6ef5] hover:bg-[#1f5be0] disabled:opacity-60 shadow-sm"
              >
                {generating ? "Generating…" : "Generate Pass"}
              </button>

              {/* Download button */}
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={!passId}
                className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 border border-[#2b6ef5] text-[#2b6ef5] hover:bg-[#eaf1ff] disabled:opacity-60"
              >
                Download PNG
              </button>
            </div>

            {/* QR code display */}
            <div className="flex flex-col items-center gap-3">
              <div
                ref={qrContainerRef}
                className="bg-white p-4 rounded-xl border"
              >
                {passId ? (
                  <QRCode
                    value={passId || " "}
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

            {/* Debugging text, remove later*/}
            <div className="mt-6 text-xs text-gray-500 text-center">
              <div>
                <span className="font-medium">userId</span> (server-owned):{" "}
                {MOCK_USER_ID}
              </div>
              <div>
                <span className="font-medium">eventId</span> (server-owned):{" "}
                {MOCK_EVENT_ID}
              </div>
              <div>
                QR encodes only <span className="font-medium">passId</span>.
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
