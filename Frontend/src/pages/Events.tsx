import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import type { Event } from "../types/Event";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { message } from "antd";

// Helper: build a query string from filters (skips empty values)
function buildQuery(params: Record<string, string>) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v && v.trim() !== "") qs.append(k, v.trim());
  });
  return qs.toString();
}

const Events: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [messageApi, contextHolder] = message.useMessage();

  // filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  //Most popular Event
  const [sortByPopularity, setSortByPopularity] = useState(false);

  // fetch whenever filters change
  useEffect(() => {
    let aborted = false;

    async function fetchEvents() {
      try {
        setLoading(true);
        setError(null);
        //assuming that the variable capacity is relevant variable
        const qs = buildQuery({
          search,
          category,
          dateFrom,
          dateTo,
          sort: sortByPopularity ? "capacity" : "",
        });
        const url = "http://localhost:8787/api/events" + (qs ? `?${qs}` : "");

        const resp = await fetch(url, { credentials: "include" });
        if (!resp.ok) throw new Error("Failed to fetch events");

        const data: Event[] = await resp.json();
        if (!aborted) setEvents(data);
      } catch (e) {
        if (!aborted) setError("Failed to fetch events");
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    fetchEvents();
    return () => {
      aborted = true;
    };
  }, [search, category, dateFrom, dateTo, sortByPopularity]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const handleClaim = async (eventObj: Event) => {
    // Check if event is full
    if (Number(eventObj.capacity) === 0) {
      messageApi.open({
        type: "error",
        content: "Sorry, no more tickets left, event is full",
      });
      return;
    }

    // If the event is free, attempt to claim immediately (no payment page)
    if (Number(eventObj.price) === 0) {
      try {
        // verify session
        const v = await fetch("http://localhost:8787/verify-session", {
          method: "GET",
          credentials: "include",
        });
        if (!v.ok) {
          // not logged in -> redirect to login and preserve claimEventId so Tickets will process it
          navigate(
            `/login?redirectTo=/student/tickets&claimEventId=${encodeURIComponent(
              String(eventObj.id)
            )}`
          );
          return;
        }

        // logged in -> call claim endpoint
        const resp = await axios.post(
          "http://localhost:8787/student/claim-ticket",
          { eventId: Number(eventObj.id) },
          { withCredentials: true }
        );

        if (resp?.data?.success) {
          // navigate to tickets and show a per-claim notification token
          const justClaimedToken = resp.data.ticketId ?? Date.now();
          navigate("/student/tickets", {
            state: { justClaimed: justClaimedToken },
          });
        } else {
          messageApi.open({
            type: "error",
            content: resp?.data?.message || "Unable to claim ticket.",
          });
        }
      } catch (err: any) {
        // Prefer server-provided message when available
        const serverMsg = err?.response?.data?.message;
        if (err?.response?.status === 409) {
          navigate("/student/tickets", {
            state: {
              claimError: "already-claimed",
              claimEventId: String(eventObj.id),
              claimToken: Date.now(),
            },
          });
        } else if (err?.response?.status === 401) {
          navigate(
            `/login?redirectTo=/student/tickets&claimEventId=${encodeURIComponent(
              String(eventObj.id)
            )}`
          );
        } else if (serverMsg) {
          messageApi.open({ type: "warning", content: String(serverMsg) });
        } else {
          messageApi.open({
            type: "error",
            content: "Failed to claim free ticket. Try again.",
          });
          console.error("Claim error:", err?.response || err.message || err);
        }
      }
      return;
    }

    // Non-free events -> existing behavior: open payment page
    navigate(`/payment?eventId=${encodeURIComponent(String(eventObj.id))}`);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-blue-100 text-blue-800",
      Career: "bg-green-100 text-green-800",
      Cultural: "bg-purple-100 text-purple-800",
      Academic: "bg-orange-100 text-orange-800",
      Sports: "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {contextHolder}
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mb-4 font-poppins">
            Upcoming Events
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Discover and join exciting events happening around campus
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {/* Search */}
          <input
            type="text"
            placeholder="Search title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-slate-300 rounded-lg px-4 py-2 w-72 outline-none focus:ring-2 focus:ring-blue-300"
          />

          {/* Category */}
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300"
          >
            <option value="">All categories</option>
            <option value="Technology">Technology</option>
            <option value="Career">Career</option>
            <option value="Cultural">Cultural</option>
            <option value="Academic">Academic</option>
            <option value="Sports">Sports</option>
          </select>

          {/* Date From */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>

          {/* Date To */}
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-600">To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border border-slate-300 rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-300"
            />
          </div>
          <Button
            onClick={() => setSortByPopularity((prev) => !prev)}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors duration-200
              ${
                sortByPopularity
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "bg-slate-200 hover:bg-slate-300 text-slate-800"
              }`}
          >
            {sortByPopularity ? "Showing Most Popular" : "Most Popular Events"}
          </Button>
        </div>

        {/* Loading & Error */}
        {loading && (
          <div className="text-center text-slate-600 mb-6">Loading…</div>
        )}
        {error && <div className="text-center text-red-600 mb-6">{error}</div>}

        {/* Events Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <Card
              key={event.id}
              className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border-0 hover:-translate-y-1"
            >
              {/* Category Badge */}
              {event.category && (
                <div className="mb-4">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                      event.category
                    )}`}
                  >
                    {event.category}
                  </span>
                </div>
              )}

              {/* Title */}
              <h3 className="text-xl font-semibold text-slate-800 mb-3 line-clamp-2">
                {event.title}
              </h3>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center text-slate-600">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="font-medium">{formatDate(event.date)}</span>
                </div>

                <div className="flex items-center text-slate-600">
                  <svg
                    className="w-5 h-5 mr-2 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  <span>{event.organization}</span>
                </div>

                {event.location && (
                  <div className="flex items-center text-slate-600">
                    <svg
                      className="w-5 h-5 mr-2 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span>{event.location}</span>
                  </div>
                )}
              </div>

              {/* Description */}
              {event.description && (
                <p className="text-slate-600 text-sm mb-4 line-clamp-3">
                  {event.description}
                </p>
              )}

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                onClick={() =>
                  navigate(`/events/${event.id}` as const, { state: { event } })
                }
              >
                View Details
              </Button>
              <Button
                onClick={() => handleClaim(event)}
                className={`w-full mt-2 font-semibold py-2 px-4 rounded-lg transition-colors duration-200 ${
                  Number(event.capacity) === 0
                    ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed text-white"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
                disabled={Number(event.capacity) === 0}
              >
                {Number(event.capacity) === 0 ? "Event Full" : "Claim Ticket"}
              </Button>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {!loading && events.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-12 h-12 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-600 mb-2">
              No events found
            </h3>
            <p className="text-slate-500">
              Try adjusting your filters or search term.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Events;
