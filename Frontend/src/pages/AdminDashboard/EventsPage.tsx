import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { message, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";

import { Button } from "@/components/ui/button";

type EventItem = {
  id: number;
  title: string;
  date?: string;
  organization?: string;
  location?: string;
  category?: string;
  description?: string;
  tags?: string[];
  contactEmail?: string;
};

const formatDate = (value?: string) => {
  if (!value) return "Date to be determined";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const EventsPage = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [messageApi, contextHolder] = message.useMessage();
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [pendingEvent, setPendingEvent] = useState<EventItem | null>(null);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get<EventItem[]>(
        "http://localhost:8787/api/events",
        {
          withCredentials: true,
        }
      );
      if (Array.isArray(data)) {
        setEvents(data);
      } else {
        setEvents([]);
      }
    } catch (error) {
      console.error("Failed to load events:", error);
      messageApi.error("Failed to load events. Please try again later.");
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [messageApi]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }, [events]);

  const handleDelete = async (eventId: number) => {
    try {
      setDeletingId(eventId);
      await axios.delete(
        `http://localhost:8787/admin/events/${eventId}`,
        {
          withCredentials: true,
        }
      );
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      messageApi.success("Event deleted.");
    } catch (error) {
      console.error("Failed to delete event:", error);
      messageApi.error("Failed to delete event. Please try again.");
    } finally {
      setDeletingId(null);
      setPendingEvent(null);
    }
  };

  const requestDelete = (event: EventItem) => {
    setPendingEvent(event);
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Spin
          indicator={<LoadingOutlined style={{ color: "blue" }} spin />}
          size="large"
        />
        {contextHolder}
      </div>
    );
  }

  return (
    <div className="p-6">
      {contextHolder}
      {pendingEvent && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-semibold text-slate-900">
              Delete “{pendingEvent.title}”?
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              This will permanently remove the event and all related saved
              tickets. This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setPendingEvent(null)}
                disabled={deletingId === pendingEvent.id}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(pendingEvent.id)}
                disabled={deletingId === pendingEvent.id}
              >
                {deletingId === pendingEvent.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button onClick={loadEvents} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </Button>
      </div>
      {sortedEvents.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800">
            No events available
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Events will appear here once they are created.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {event.title}
                  </h3>
                  <span className="text-xs text-slate-500">
                    ID: {event.id}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {formatDate(event.date)}
                </p>
                {event.organization && (
                  <p className="mt-2 text-sm text-slate-600">
                    Organized by {event.organization}
                  </p>
                )}
                {event.location && (
                  <p className="mt-1 text-sm text-slate-600">
                    Location: {event.location}
                  </p>
                )}
                {event.category && (
                  <p className="mt-1 text-sm text-slate-600">
                    Category: {event.category}
                  </p>
                )}
                {event.description && (
                  <p className="mt-3 text-sm text-slate-700 line-clamp-4">
                    {event.description}
                  </p>
                )}
                {event.tags && event.tags.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {event.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {event.contactEmail && (
                  <p className="mt-3 text-xs text-slate-500">
                    Contact: {event.contactEmail}
                  </p>
                )}
              </div>
              <div className="mt-6 flex justify-end">
                <Button
                  variant="destructive"
                  onClick={() => requestDelete(event)}
                  disabled={deletingId === event.id}
                >
                  {deletingId === event.id ? "Deleting..." : "Delete event"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;
