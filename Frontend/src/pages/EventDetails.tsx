import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/navbar";
import type { Event } from "../types/Event";
import axios from "axios";
import { message } from "antd";

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

const formatTime = (timeString?: string) => {
  if (!timeString) return "";
  return new Date(`2000-01-01T${timeString}`).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { event?: Event } };

  const [event, setEvent] = useState<Event | null>(
    location.state?.event || null
  );
  const [loading, setLoading] = useState<boolean>(!location.state?.event);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let aborted = false;
    if (event || !id) return; // nothing to do if we already have it or no id

    async function fetchEventById() {
      try {
        setLoading(true);
        setError(null);
        // Backend doesn't expose single-event endpoint; fetch all and pick one
        const resp = await fetch("http://localhost:8787/api/events", {
          credentials: "include",
        });
        if (!resp.ok) throw new Error("Failed to fetch events");
        const data: Event[] = await resp.json();
        const found = data.find((e) => String(e.id) === String(id)) || null;
        if (!aborted) {
          if (found) setEvent(found);
          else setError("Event not found");
        }
      } catch (e) {
        if (!aborted) setError("Failed to load event");
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    fetchEventById();
    return () => {
      aborted = true;
    };
  }, [id, event]);

  const getCategoryColor = (category?: string) => {
    const colors: Record<string, string> = {
      Technology: "bg-blue-100 text-blue-800 border-blue-200",
      Career: "bg-green-100 text-green-800 border-green-200",
      Cultural: "bg-purple-100 text-purple-800 border-purple-200",
      Academic: "bg-orange-100 text-orange-800 border-orange-200",
      Sports: "bg-red-100 text-red-800 border-red-200",
    };
    return (
      colors[category || ""] || "bg-gray-100 text-gray-800 border-gray-200"
    );
  };

  const [messageApi, contextHolder] = message.useMessage();

  // Claim ticket flow: if logged in, POST to claim endpoint and navigate to tickets (in the student dashboard)
  // otherwise redirect to login preserving claimEventId.
  const handleGetTicket = async (eventId?: string) => {
    if (!eventId) return;
    // Navigate to the payment page which handles login redirect and the claim after payment
    navigate(`/payment?eventId=${encodeURIComponent(String(eventId))}`);
  };

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Event saved successfully!",
    });
  };

  const showWarning = () => {
    messageApi.open({
      type: "warning",
      content: "You need to be logged in to save events.",
    });
  };

  const getCategoryIcon = (category?: string) => {
    const icons: Record<string, string> = {
      Technology: "💻",
      Career: "💼",
      Cultural: "🎭",
      Academic: "📚",
      Sports: "⚽",
    };
    return icons[category || ""] || "📅";
  };

  const saveEvent = async (id: string | undefined) => {
    if (!id) return;

    try {
      const response = await axios.post(
        "http://localhost:8787/student/saveEvent",
        { eventId: id },
        { withCredentials: true }
      );
      if (response.status === 200) {
        if (response.data.saved) success();
        else {
          messageApi.open({
            type: "warning",
            content: "Event already saved.",
          });
        }
      } else {
        showWarning();
      }
    } catch (error) {
      showWarning();
      return;
    }
  };

  const renderEventTemplate = () => {
    if (!event) return null;

    return (
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="relative">
          {event.imageUrl ? (
            <div className="h-64 md:h-80 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl overflow-hidden">
              <img
                src={event.imageUrl}
                alt={event.title}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="h-64 md:h-80 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">
                  {getCategoryIcon(event.category)}
                </div>
                <h1 className="text-3xl md:text-4xl font-bold">
                  {event.title}
                </h1>
              </div>
            </div>
          )}

          {/* Category Badge */}
          {event.category && (
            <div className="absolute top-4 left-4">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(
                  event.category
                )}`}
              >
                {getCategoryIcon(event.category)} {event.category}
              </span>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Event Title & Organization */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                {event.title}
              </h1>
              <div className="flex items-center text-slate-600 mb-4">
                <svg
                  className="w-5 h-5 mr-2"
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
                <span className="text-lg font-medium">
                  {event.organization}
                </span>
              </div>
            </div>

            {/* Description */}
            {(event.longDescription || event.description) && (
              <Card className="p-6 bg-white border-0 shadow-lg">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  About This Event
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-7 whitespace-pre-line">
                    {event.longDescription || event.description}
                  </p>
                </div>
              </Card>
            )}

            {/* Requirements */}
            {event.requirements && (
              <Card className="p-6 bg-white border-0 shadow-lg">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  Requirements
                </h2>
                <div className="prose prose-slate max-w-none">
                  <p className="text-slate-700 leading-7 whitespace-pre-line">
                    {event.requirements}
                  </p>
                </div>
              </Card>
            )}

            {/* Tags */}
            {event.tags && event.tags.length > 0 && (
              <Card className="p-6 bg-white border-0 shadow-lg">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  Tags
                </h2>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Right Column - Event Details */}
          <div className="space-y-6">
            {/* Event Details Card */}
            <Card className="p-6 bg-white border-0 shadow-lg sticky top-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Event Details
              </h2>

              <div className="space-y-4">
                {/* Date & Time */}
                <div className="flex items-start">
                  <svg
                    className="w-5 h-5 mr-3 mt-0.5 text-blue-600"
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
                  <div>
                    <div className="font-medium text-slate-800">
                      {formatDate(event.date)}
                    </div>
                    {(event.startTime || event.endTime) && (
                      <div className="text-sm text-slate-600">
                        {event.startTime && formatTime(event.startTime)}
                        {event.startTime && event.endTime && " - "}
                        {event.endTime && formatTime(event.endTime)}
                      </div>
                    )}
                  </div>
                </div>

                {/* Location */}
                {event.location && (
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-3 mt-0.5 text-blue-600"
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
                    <div>
                      <div className="font-medium text-slate-800">
                        {event.location}
                      </div>
                      {event.isOnline && (
                        <div className="text-sm text-blue-600">
                          Online Event
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Meeting Link for Online Events */}
                {event.isOnline && event.meetingLink && (
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-3 mt-0.5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                    <div>
                      <div className="font-medium text-slate-800">
                        Meeting Link
                      </div>
                      <a
                        href={event.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 underline"
                      >
                        Join Meeting
                      </a>
                    </div>
                  </div>
                )}

                {/* Capacity */}
                {event.capacity && (
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-3 mt-0.5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    <div>
                      <div className="font-medium text-slate-800">Capacity</div>
                      <div className="text-sm text-slate-600">
                        {event.capacity} attendees
                      </div>
                    </div>
                  </div>
                )}

                {/* Price */}
                {event.price !== undefined && (
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-3 mt-0.5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                    <div>
                      <div className="font-medium text-slate-800">Price</div>
                      <div className="text-sm text-slate-600">
                        {event.price === 0 ? "Free" : `$${event.price}`}
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration Deadline */}
                {event.registrationDeadline && (
                  <div className="flex items-start">
                    <svg
                      className="w-5 h-5 mr-3 mt-0.5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <div>
                      <div className="font-medium text-slate-800">
                        Registration Deadline
                      </div>
                      <div className="text-sm text-slate-600">
                        {formatDate(event.registrationDeadline)}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-6 space-y-3">
                <Button
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3"
                  onClick={() => handleGetTicket(id)}
                >
                  Get Ticket
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-slate-300 text-slate-700 hover:bg-slate-50"
                  onClick={() => saveEvent(id)}
                >
                  Save Event
                </Button>
              </div>
            </Card>

            {/* Contact Information */}
            {(event.contactEmail || event.contactPhone) && (
              <Card className="p-6 bg-white border-0 shadow-lg">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">
                  Contact
                </h2>
                <div className="space-y-3">
                  {event.contactEmail && (
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <a
                        href={`mailto:${event.contactEmail}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {event.contactEmail}
                      </a>
                    </div>
                  )}
                  {event.contactPhone && (
                    <div className="flex items-center">
                      <svg
                        className="w-5 h-5 mr-3 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        />
                      </svg>
                      <a
                        href={`tel:${event.contactPhone}`}
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        {event.contactPhone}
                      </a>
                    </div>
                  )}
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-6">
            <Button
              className="bg-slate-200 hover:bg-slate-300 text-slate-800"
              onClick={() => navigate(-1)}
            >
              ← Back
            </Button>
          </div>

          {loading && (
            <div className="text-center text-slate-600">Loading…</div>
          )}
          {error && <div className="text-center text-red-600">{error}</div>}
          {!loading && !error && event && renderEventTemplate()}
        </main>
      </div>
    </>
  );
};

export default EventDetails;
