import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Spin, message } from "antd";
import { LoadingOutlined, DownloadOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

interface ManagerProfile {
  username: string;
  email: string;
}

interface EventSummary {
  id: number;
  title: string;
  date: string;
  location?: string;
  description?: string;
  tags?: string[];
  contactEmail?: string;
}

const MyEvents: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [profile, setProfile] = useState<ManagerProfile | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      setError(false);
      try {
        const [profileResponse, eventsResponse] = await Promise.all([
          axios.get("http://localhost:8787/profile", { withCredentials: true }),
          axios.get("http://localhost:8787/api/events", {
            withCredentials: true,
            params: { managerOnly: true }, // <-- only filter for manager dashboard
          }),
        ]);

        if (profileResponse.data?.success && profileResponse.data?.profile) {
          setProfile(profileResponse.data.profile);
        } else {
          setProfile(null);
        }

        if (Array.isArray(eventsResponse.data)) {
          setEvents(eventsResponse.data);
        } else {
          setEvents([]);
        }
      } catch (err) {
        console.error("Error loading manager events:", err);
        setError(true);
        messageApi.error("Failed to load events. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [messageApi]);

  const filteredEvents = events;
  const filterApplied = false;

  const formatDate = (iso?: string) => {
    if (!iso) return "Date to be determined";
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "Date to be determined";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTags = (tags?: string[]) => {
    if (!tags || tags.length === 0) return null;
    return tags;
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleDownload = async (event: EventSummary) => {
    try {
      setDownloadingId(event.id);
      const response = await axios.get<Blob>(
        `http://localhost:8787/manager/events/${event.id}/attendees/export`,
        {
          responseType: "blob",
          withCredentials: true,
        }
      );

      const blob = new Blob([response.data], {
        type: "text/csv;charset=utf-8",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      const safeTitle = event.title
        ? slugify(event.title)
        : `event-${event.id}`;
      anchor.download = `${safeTitle || `event-${event.id}`}-attendees.csv`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);

      messageApi.success(`Attendees exported for "${event.title}".`);
    } catch (err) {
      console.error("Failed to export attendees:", err);
      messageApi.error(
        "Unable to export attendees list. Please try again later."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading) {
    return (
      <div className="ml-4 mr-4 mt-2 flex h-[98%] items-center justify-center">
        <Spin
          indicator={<LoadingOutlined style={{ color: "blue" }} spin />}
          size="large"
        />
        {contextHolder}
      </div>
    );
  }

  if (error) {
    return (
      <div className="ml-4 mr-4 mt-2 flex h-[98%] items-center justify-center">
        {contextHolder}
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-600">
          We were unable to load your events. Please refresh the page to try
          again.
        </div>
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <div className="ml-4 mr-4 mt-2 flex h-[98%] items-center justify-center">
        {contextHolder}
        <div className="rounded-lg border border-slate-200 bg-white px-8 py-10 text-center shadow-sm">
          <h2 className="text-xl font-semibold text-slate-800">
            No events found
          </h2>
          <p className="mt-2 text-slate-600">
            Create an event to see it listed here and export attendee reports.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="ml-4 mr-4 mt-2 mb-10 flex h-[98%] justify-center overflow-y-auto">
      {contextHolder}
      <div className="mt-4 w-full max-w-6xl">
        <div className="grid gap-6 md:grid-cols-2">
          {filteredEvents.map((event) => {
            const tagList = formatTags(event.tags);
            return (
              <div
                key={event.id}
                className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-slate-900">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {formatDate(event.date)}
                  </p>
                  {event.location && (
                    <p className="mt-1 text-sm text-slate-600">
                      Location: {event.location}
                    </p>
                  )}
                  {event.description && (
                    <p className="mt-3 text-sm text-slate-700">
                      {event.description}
                    </p>
                  )}
                  {tagList && tagList.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {tagList.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-6 flex items-center justify-between gap-2">
                  <div className="text-xs text-slate-500">
                    Event ID: <span className="font-medium">{event.id}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        handleDownload(event);
                      }}
                      disabled={downloadingId === event.id}
                      className="flex items-center gap-2 bg-blue-600 text-white hover:bg-blue-700"
                    >
                      <DownloadOutlined />
                      {downloadingId === event.id
                        ? "Preparing..."
                        : "Export CSV"}
                    </Button>
                    <Button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        window.location.href = `/manager/event/${event.id}`;
                      }}
                      className="flex items-center gap-2 bg-gray-600 text-white hover:bg-gray-700"
                    >
                      Analytics
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MyEvents;
