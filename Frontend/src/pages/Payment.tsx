import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import Navbar from "@/components/navbar";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

const Payment: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("eventId") || undefined;
  const navigate = useNavigate();
  const location = useLocation() as { state?: { event?: any } };
  const [loading, setLoading] = useState<boolean>(true);
  const [event, setEvent] = useState<any | null>(location.state?.event || null);
  const [name, setName] = useState("");
  const [card, setCard] = useState("");
  const [exp, setExp] = useState("");
  const [cvv, setCvv] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const processingTimeoutRef = useRef<number | null>(null);
  const freeClaimAttemptRef = useRef<boolean>(false);
  const PROCESSING_MS = 2500; // milliseconds to show mock processing

  // Helper: defer showing messages to avoid "calling notice in render" warning
  const showMessage = (opts: Parameters<typeof messageApi.open>[0]) =>
    setTimeout(() => messageApi.open(opts), 0);

  useEffect(() => {
    if (!eventId) {
      showMessage({ type: "error", content: "No event specified." });
      navigate("/events");
      return;
    }

    const verifyAndLoad = async () => {
      try {
        // check session
        const v = await fetch("http://localhost:8787/verify-session", {
          method: "GET",
          credentials: "include",
        });
        if (!v.ok) {
          // not logged in -> redirect to login and come back here
          navigate(
            `/login?redirectTo=/payment&claimEventId=${encodeURIComponent(
              String(eventId)
            )}`
          );
          return;
        }

        // If we already have event from state, use it
        if (event) {
          // if event is free and we haven't attempted claiming yet, claim it directly
          if (event.price === 0 && !freeClaimAttemptRef.current) {
            freeClaimAttemptRef.current = true;
            try {
              const resp = await axios.post(
                "http://localhost:8787/student/claim-ticket",
                { eventId: Number(eventId) },
                { withCredentials: true }
              );
              if (resp?.data?.success) {
                const justClaimedToken = resp.data.ticketId ?? Date.now();
                navigate("/student/tickets", {
                  state: { justClaimed: justClaimedToken },
                });
                return;
              } else {
                showMessage({
                  type: "error",
                  content: resp?.data?.message || "Unable to claim ticket.",
                });
              }
            } catch (err: any) {
              if (err?.response?.status === 409) {
                navigate("/student/tickets", {
                  state: {
                    claimError: "already-claimed",
                    claimEventId: String(eventId),
                    claimToken: Date.now(),
                  },
                });
                return;
              } else if (err?.response?.status === 400) {
                showMessage({
                  type: "error",
                  content: "Sorry, the event is fully booked.",
                });
                return;
              } else {
                showMessage({
                  type: "error",
                  content: "Failed to claim free ticket.",
                });
              }
            }
          }
          setLoading(false);
          return;
        }

        // fetch events and pick one (backend doesn't have single event endpoint)
        const resp = await fetch("http://localhost:8787/api/events", {
          credentials: "include",
        });
        if (!resp.ok) throw new Error("Failed to load event");
        const data = await resp.json();
        const found = data.find((e: any) => String(e.id) === String(eventId));
        if (!found) {
          showMessage({ type: "error", content: "Event not found." });
          navigate("/events");
          return;
        }
        setEvent(found);

        // if the event is free, immediately claim it (skip payment)
        if (found.price === 0 && !freeClaimAttemptRef.current) {
          freeClaimAttemptRef.current = true;
          try {
            const claimResp = await axios.post(
              "http://localhost:8787/student/claim-ticket",
              { eventId: Number(eventId) },
              { withCredentials: true }
            );
            if (claimResp?.data?.success) {
              const justClaimedToken = claimResp.data.ticketId ?? Date.now();
              navigate("/student/tickets", {
                state: { justClaimed: justClaimedToken },
              });
              return;
            } else {
              showMessage({
                type: "error",
                content: claimResp?.data?.message || "Unable to claim ticket.",
              });
            }
          } catch (err: any) {
            if (err?.response?.status === 409) {
              navigate("/student/tickets", {
                state: {
                  claimError: "already-claimed",
                  claimEventId: String(eventId),
                  claimToken: Date.now(),
                },
              });
              return;
            } else if (err?.response?.status === 401) {
              // if session expired, redirect to login preserving claimEventId
              navigate(
                `/login?redirectTo=/payment&claimEventId=${encodeURIComponent(
                  String(eventId)
                )}`
              );
              return;
            } else {
              showMessage({
                type: "error",
                content: "Failed to claim free ticket.",
              });
            }
          }
        }
      } catch (err) {
        console.error("Payment load error:", err);
        showMessage({
          type: "error",
          content: "Unable to load event or session. Try again.",
        });
        navigate("/events");
      } finally {
        setLoading(false);
      }
    };

    verifyAndLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  useEffect(() => {
    return () => {
      // Clear any pending processing timeout on unmount
      if (processingTimeoutRef.current) {
        clearTimeout(processingTimeoutRef.current);
        processingTimeoutRef.current = null;
      }
    };
  }, []);

  const submitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventId) return;
    // Minimal mock validation
    if (!name || card.length < 12 || !exp || cvv.length < 3) {
      showMessage({
        type: "warning",
        content: "Please fill valid payment info.",
      });
      return;
    }
    setSubmitting(true);
    try {
      const resp = await axios.post(
        "http://localhost:8787/student/pay-and-claim",
        {
          eventId: Number(eventId),
          payment: {
            name,
            card,
            exp,
            cvv,
          },
        },
        { withCredentials: true }
      );

      if (resp.data && resp.data.success) {
        // Show a mock "processing payment" screen for a short time,
        // then show success and continue the normal flow.
        setSubmitting(false);
        setProcessing(true);
        // Ensure we send a unique token so Tickets can show a notification per successful claim
        const justClaimedToken = resp.data.ticketId ?? Date.now();
        processingTimeoutRef.current = window.setTimeout(() => {
          // Navigate to student tickets and indicate a recent claim so Tickets.tsx can show a notification
          setProcessing(false);
          navigate("/student/tickets", {
            state: { justClaimed: justClaimedToken },
          });
        }, PROCESSING_MS);
        return;
      } else {
        // Prefer any server-provided message, fallback to generic
        showMessage({
          type: "error",
          content: resp.data?.message || "Payment/claim failed.",
        });
      }
    } catch (err: any) {
      console.error("Payment error:", err?.response || err.message);

      // If backend tells us the ticket was already claimed (HTTP 409), surface a clear warning to the user
      if (err?.response?.status === 409) {
        navigate("/student/tickets", {
          state: {
            claimError: "already-claimed",
            claimEventId: String(eventId),
            claimToken: Date.now(),
          },
        });
      } else if (
        err?.response?.status === 400 &&
        err?.response?.data?.message
      ) {
        // Show backend validation message for bad payment data if present
        showMessage({
          type: "warning",
          content: err.response.data.message,
        });
      } else {
        showMessage({
          type: "error",
          content: "Payment failed. Please try again.",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <div className="max-w-3xl mx-auto p-8 text-center">Loading…</div>
      </div>
    );
  }

  if (processing) {
    const antIcon = (
      <LoadingOutlined style={{ fontSize: 48, color: "#2563eb" }} spin />
    );
    return (
      <>
        {contextHolder}
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg shadow-lg text-center">
            <Spin indicator={antIcon} />
            <div className="mt-4 text-slate-700 font-medium">
              Processing payment…
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="max-w-3xl mx-auto p-6">
          <h2 className="text-2xl font-semibold mb-4">
            Payment for: {event?.title || "Event"}
          </h2>
          <div className="bg-white rounded-lg p-6 shadow mb-6">
            <div className="mb-4">
              <strong>Date:</strong>{" "}
              {event?.date
                ? new Date(event.date).toLocaleDateString()
                : "Unknown"}
            </div>
            <div className="mb-4">
              <strong>Location:</strong>{" "}
              {event?.location || (event?.isOnline ? "Online" : "Unknown")}
            </div>
            <div className="mb-4">
              <strong>Price:</strong>{" "}
              {event?.price === 0
                ? "Free"
                : event?.price
                ? `$${event.price}`
                : "TBD"}
            </div>
          </div>

          <form
            onSubmit={submitPayment}
            className="bg-white p-6 rounded-lg shadow"
          >
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Name on Card
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              />
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium mb-1">
                Card Number
              </label>
              <input
                value={card}
                onChange={(e) => setCard(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                placeholder="1234 5678 9012 3456"
              />
            </div>
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="block text-sm font-medium mb-1">
                  Expiry (MM/YY)
                </label>
                <input
                  value={exp}
                  onChange={(e) => setExp(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="12/25"
                />
              </div>
              <div style={{ width: 140 }}>
                <label className="block text-sm font-medium mb-1">CVV</label>
                <input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  className="w-full border px-3 py-2 rounded"
                  placeholder="123"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="submit"
                className="bg-blue-600 text-white"
                disabled={submitting}
              >
                {submitting ? "Processing…" : `Pay & Claim Ticket`}
              </Button>
              <Button variant="outline" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </main>
      </div>
    </>
  );
};

export default Payment;
