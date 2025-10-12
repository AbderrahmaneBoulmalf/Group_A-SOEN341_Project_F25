import React, { useState, useEffect, useRef } from "react";
import { Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

const Tickets: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [error, setError] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

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

    const init = async () => {
      setLoading(true);
      try {
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

              // Remove claimEventId from URL so refresh won't re-trigger claim
              navigate(location.pathname, { replace: true });
            } catch (err: any) {
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
      <div className="ml-4 mb-10 mr-4 mt-2 flex items-center justify-center h-98">
        <Spin
          indicator={
            <LoadingOutlined style={{ color: "blue" }} spin sizes="large" />
          }
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-40 items-center justify-center text-center text-red-400">
        <p>Error loading data... Please try again later.</p>
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-80 px-4 py-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">No ticket</h2>
        <p className="text-slate-600 text-md mb-6">
          No ticket has been claimed. Look for events to claim tickets.
        </p>
        <Link to="/events">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-200px border-0">
            Search for Events
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mb-10 ml-4 mr-4 mt-2">
      <div className="mt-4 flex flex-col gap-y-6">
        {tickets.map((ticket) => (
          <div key={ticket.id} className="bg-white rounded-lg shadow p-6">
            <div className="font-bold">
              Event: {ticket.eventTitle || "Unknown title"}
            </div>
            <div>Date: {formatDate(ticket.date)}</div>
            <div>Location: {ticket.location || "Unknown location"}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tickets;
