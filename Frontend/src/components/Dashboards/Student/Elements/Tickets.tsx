import React, { useState, useEffect, useRef } from "react";
import { Spin, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Tickets: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();
  const getEventId = (t: any) => t.eventId ?? t.eventID ?? t.event_id ?? t.id;
  const [messageApi, contextHolder] = message.useMessage();
  const showMessage = (opts: Parameters<typeof messageApi.open>[0]) =>
    setTimeout(() => messageApi.open(opts), 0);

  const fetchTickets = async () => {
    try {
      setError(false);
      const response = await axios.get(
        "http://localhost:8787/student/tickets",
        { withCredentials: true }
      );
      if (response.data.success) {
        setTickets(response.data.tickets || []);
      } else {
        setTickets([]);
      }
    } catch (e) {
      setError(true);
    }
  };

  useEffect(() => {
    const qs = new URLSearchParams(location.search);
    const claimEventId = qs.get("claimEventId");
    const justClaimed = (location.state as any)?.justClaimed;

    const init = async () => {
      setLoading(true);
      try {
        // If we arrived after a payment flow, show a success notification once (guard StrictMode double-mount)
        if (justClaimed) {
          const shownKey = `justClaimedShown`;
          if (!sessionStorage.getItem(shownKey)) {
            sessionStorage.setItem(shownKey, "1");
            showMessage({
              type: "success",
              content: "Ticket claimed successfully.",
            });
          } else {
            console.debug(
              "justClaimed notification already shown (dev StrictMode guard)"
            );
          }
          // clear state so refresh doesn't re-show
          navigate(location.pathname, { replace: true, state: {} });
        }

        // If we have a claimEventId from redirect after login, attempt to claim it
        if (claimEventId) {
          // Prevent re-processing the same claimEventId in StrictMode double-mount
          const processedKey = `claimed_${claimEventId}`;
          if (sessionStorage.getItem(processedKey)) {
            console.log("claimEventId already processed:", claimEventId);
          } else {
            sessionStorage.setItem(processedKey, "1");
            try {
              const resp = await axios.post(
                "http://localhost:8787/student/claim-ticket",
                { eventId: Number(claimEventId) },
                {
                  withCredentials: true,
                  headers: { "Content-Type": "application/json" },
                }
              );

              // Notify user on success / sensible fallback messages
              if (resp && resp.data && resp.data.success) {
                showMessage({
                  type: "success",
                  content: "Ticket claimed successfully.",
                });
              } else if (resp && resp.status === 409) {
                showMessage({
                  type: "warning",
                  content: "Ticket was already claimed.",
                });
              } else {
                showMessage({
                  type: "error",
                  content: "Unable to claim ticket. Try again later.",
                });
              }

              // Remove claimEventId from URL so refresh won't re-trigger claim
              navigate(location.pathname, { replace: true });
            } catch (err: any) {
              // Show specific feedback if possible
              if (err?.response?.status === 409) {
                showMessage({
                  type: "warning",
                  content: "Ticket already claimed.",
                });
              } else if (err?.response?.status === 401) {
                showMessage({
                  type: "warning",
                  content: "You need to be logged in to claim a ticket.",
                });
              } else {
                showMessage({
                  type: "error",
                  content: "Failed to claim ticket.",
                });
              }
              console.error(
                "Claim failed:",
                err?.response?.status,
                err?.response?.data || err.message
              );
            }
          }
        }

        await fetchTickets();
      } finally {
        setLoading(false);
      }
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "Unknown date";
    const d = new Date(iso);
    if (isNaN(d.getTime())) return "Unknown date";
    return d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <>
        {contextHolder}
        <div className="ml-4 mb-10 mr-4 mt-2 flex items-center justify-center h-98">
          <Spin
            indicator={
              <LoadingOutlined style={{ color: "blue" }} spin sizes="large" />
            }
          />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {contextHolder}
        <div className="flex h-40 items-center justify-center text-center text-red-400">
          <p>Error loading data... Please try again later.</p>
        </div>
      </>
    );
  }

  if (tickets.length === 0) {
    return (
      <>
        {contextHolder}
        <div className="flex flex-col items-center justify-center h-80 px-4 py-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            No ticket
          </h2>
          <p className="text-slate-600 text-md mb-6">
            No ticket has been claimed. Look for events to claim tickets.
          </p>
          <Link to="/events">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-200px border-0">
              Search for Events
            </button>
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <div className="mb-10 ml-4 mr-4 mt-2">
        <div className="mt-4 flex flex-col gap-y-6">
          {tickets.map((ticket) => {
            const evId = getEventId(ticket);
            return (
              <div
                key={ticket.id ?? evId}
                className="bg-white rounded-lg shadow p-6"
              >
                <div className="font-bold">
                  Event: {ticket.eventTitle || "Unknown title"}
                </div>
                <div>Date: {formatDate(ticket.date)}</div>
                <div>Location: {ticket.location || "Unknown location"}</div>

                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/qr/${evId}`)}
                    disabled={!evId}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md disabled:opacity-60"
                    title={
                      evId
                        ? "Open QR generator for this event"
                        : "No event id available"
                    }
                  >
                    Generate QR
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Tickets;
