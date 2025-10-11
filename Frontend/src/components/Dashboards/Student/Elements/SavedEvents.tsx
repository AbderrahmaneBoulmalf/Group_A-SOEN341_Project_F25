import React, { useState, useEffect } from "react";
import { Spin, Popover, message } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import EmptyEvents from "../SavedEvents/EmptyEvents";
import { saved } from "@/pages/StudentDashboard/SidebarIcons";

interface eventType {
  category: string;
  date: string;
  description: string;
  id: number;
  location: string;
  organization: string;
  title: string;
}

const SavedEvents: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [events, setEvents] = useState<eventType[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();

  const success = () => {
    messageApi.open({
      type: "success",
      content: "Event unsaved successfully!",
    });
  };

  const showError = () => {
    messageApi.open({
      type: "error",
      content: "Event unsaving failed. Please try again.",
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Technology: "bg-blue-100 text-blue-800",
      Career: "bg-green-100 text-green-800",
      Cultural: "bg-purple-100 text-purple-800",
      Academic: "bg-orange-100 text-orange-800",
      Sports: "bg-red-100 text-red-800",
    };
    return colors[category] || "bg-gray-100 text-gray-800";
  };

  const fetchSavedEvents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8787/student/saved-events",
        { withCredentials: true }
      );

      if (response.data.success) {
        setEvents(response.data.savedEvents);
        response.data.savedEvents.length === 0
          ? setIsEmpty(true)
          : setIsEmpty(false);
      } else {
        setEvents([]);
      }
    } catch (error: any) {
      setError(true);
      console.error("Error fetching saved events:", error.message);
    } finally {
      setLoading(false);
    }
  };

  const unsaveEvent = async (eventId: number) => {
    try {
      const response = await axios.post(
        "http://localhost:8787/student/unsave-event",
        { eventId },
        { withCredentials: true }
      );

      if (response.data.success) {
        const newEvents = events.filter((event) => event.id !== eventId);
        setEvents(newEvents);
        if (newEvents.length === 0) {
          setIsEmpty(true);
        }
        success();
      }
    } catch (error) {
      showError();
      console.error("Error unsaving event:", error);
    }
  };

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  return (
    <>
      {contextHolder}
      <div className="ml-4 mb-10 mr-4 mt-2 flex items-center justify-center h-[98%]">
        {loading && (
          <div className="flex items-center justify-center">
            <Spin
              indicator={<LoadingOutlined spin style={{ color: "blue" }} />}
              size="large"
            />
          </div>
        )}
        {error ? (
          <div className="flex h-40 items-center justify-center text-center text-red-400">
            <p>Error fetching data. Please try again later.</p>
          </div>
        ) : isEmpty ? (
          <EmptyEvents />
        ) : (
          <div className="flex flex-col gap-y-6 overflow-y-auto max-h-[80vh] w-full px-4 py-6 h-full">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex flex-col sm:flex-row items-start sm:items-stretch justify-between w-full bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-100 backdrop-blur-sm"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center w-full sm:w-2/3 gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-24 h-24 bg-blue-100 rounded-xl flex items-center justify-center shrink-0 text-blue-600 font-bold text-2xl">
                      {event.title?.charAt(0) || "E"}
                    </div>
                    <div>
                      {event.category && (
                        <div className="mb-2">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(
                              event.category
                            )}`}
                          >
                            {event.category}
                          </span>
                        </div>
                      )}
                      <h3 className="text-lg font-semibold text-slate-800 mb-2">
                        {event.title}
                      </h3>
                      <div className="space-y-1 text-slate-600 text-sm">
                        <div className="flex items-center">
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
                          <span className="font-medium">
                            {formatDate(event.date)}
                          </span>
                        </div>
                        <div className="flex items-center">
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
                          <div className="flex items-center">
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
                    </div>
                  </div>
                  {event.description && (
                    <p className="text-slate-600 text-sm line-clamp-3 sm:ml-8 sm:flex-1 sm:max-w-[50%] mt-4 sm:mt-0">
                      {event.description}
                    </p>
                  )}
                </div>
                <div className="w-full sm:w-1/3 mt-6 sm:mt-0 flex flex-col items-center sm:items-end justify-between sm:justify-center gap-4 sm:gap-6 sm:h-full">
                  <Popover
                    content={
                      <p className="text-white text-sm font-medium">Unsave</p>
                    }
                    placement="top"
                    color="#fb2c36"
                  >
                    <div
                      className="p-3 border border-gray-200 rounded-xl flex items-center justify-center w-12 h-12 bg-slate-50 text-blue-600 shadow-sm hover:shadow-md hover:text-red-500 hover:border-red-200 transition-all duration-200 cursor-pointer"
                      onMouseDown={() => unsaveEvent(event.id)}
                    >
                      {saved}
                    </div>
                  </Popover>

                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-[200px] border-0"
                    onClick={() =>
                      navigate(`/events/${event.id}` as const, {
                        state: { event },
                      })
                    }
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
            <div className="w-full flex flex-col items-center justify-center">
              <span className="text-sm text-slate-500 mb-10">
                {events.length} {events.length === 1 ? "Event" : "events"}{" "}
                found.
              </span>
              <div className="flex items-center flex-col mt-10">
                <h2 className="text-lg font-semibold text-slate-800 mb-3">
                  Looking for more events?
                </h2>
                <p className="text-slate-600 text-md mb-6">
                  Browse upcoming opportunities and discover new events to save.
                </p>
                <Link to="/events">
                  <Button
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-[200px] border-0"
                  >
                    Search for Events
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SavedEvents;
