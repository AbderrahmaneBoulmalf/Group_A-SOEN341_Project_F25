import React, { useState, useEffect } from "react";
import { Badge, Calendar } from "antd";
import type { BadgeProps, CalendarProps } from "antd";
import type { Dayjs } from "dayjs";
import axios from "axios";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CalendarEvent {
  title: string;
  date: string;
}

const CalendarPage: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  useEffect(() => {
    const fetchCalendarData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8787/student/calendar",
          { withCredentials: true }
        );
        if (response.data.success) {
          setEvents(response.data.events);
        }
      } catch (error) {
        console.error("Error fetching calendar data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCalendarData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const getListData = (value: Dayjs) => {
    const currentDate = value.format("YYYY-MM-DD");
    const listData = events
      .filter((event) => event.date.slice(0, 10) === currentDate)
      .map((event) => {
        const today = new Date();
        const isPastEvent = new Date(event.date) < today;
        const status: BadgeProps["status"] = isPastEvent
          ? "warning"
          : "success";
        return { type: status, content: event.title };
      });
    return listData || [];
  };

  const dateCellRender = (value: Dayjs) => {
    const listData = getListData(value);

    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.content}>
            <Badge
              status={item.type as BadgeProps["status"]}
              text={item.content}
            />
          </li>
        ))}
      </ul>
    );
  };

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (info.type === "date") {
      return dateCellRender(current);
    }
    return info.originNode;
  };

  return (
    <div className="ml-4 mb-10 mr-4 mt-2 flex flex-col gap-4 justify-center h-[98%]">
      <div className="w-full">
        <div className="flex flex-row gap-x-6">
          <span className="flex items-center gap-x-2">
            <span className="w-3 h-3 rounded-full bg-amber-600" />
            <p className="text-amber-600 text-sm">Past Events</p>
          </span>
          <span className="flex items-center gap-x-2">
            <span className="w-3 h-3 rounded-full bg-green-600" />
            <p className="text-green-600 text-sm">Upcoming Events</p>
          </span>
        </div>
      </div>
      <Calendar cellRender={cellRender} />
      <div className="w-full flex flex-col items-center justify-center mt-4">
        <p className="text-slate-800 text-md mb-6">
          Displayed events are events from which you claimed tickets for.
        </p>
        <Link to="/events">
          <Button
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-[200px] border-0"
          >
            Search for More Events
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CalendarPage;
