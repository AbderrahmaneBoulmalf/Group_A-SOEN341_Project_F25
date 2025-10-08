import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Empty, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import axios from "axios";

interface eventType {
  id: number;
  title: string;
  date: string;
  organization: string;
  location: string;
  description: string;
  category: string;
}

const SavedEvents: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [events, setEvents] = useState<eventType[]>([]);
  const [error, setError] = useState<boolean>(false);
  const [isEmpty, setIsEmpty] = useState<boolean>(false);

  const fetchSavedEvents = async () => {
    try {
      const response = await axios.get(
        "http://localhost:8787/student/saved-events",
        { withCredentials: true }
      );

      if (response.data.success) {
        setEvents(response.data.savedEvents);
      } else {
        setEvents([]);
      }
    } catch (error: any) {
      setError(true);
      console.error("Error fetching saved events:", error.message);
    } finally {
      if (events.length === 0) {
        setIsEmpty(true);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedEvents();
  }, []);

  return (
    <div className="ml-4 mb-10 mr-4 mt-2 flex items-center justify-center h-[98%]">
      {loading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
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
        <Empty
          description={
            <p className="text-gray-900 text-lg font-semibold">
              No saved events
            </p>
          }
          styles={{ image: { height: 180 } }}
        >
          <Link to="/events">
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 min-w-[200px] border-0"
            >
              Browse Events
            </Button>
          </Link>
        </Empty>
      ) : (
        <div>
          {/* Styling to be changed, just a placeholder for now */}
          {events.map((event) => (
            <div key={event.id} className="border-b border-gray-200 py-4">
              <h3 className="text-lg font-semibold">{event.title}</h3>
              <p className="text-gray-600">{event.date}</p>
              <p className="text-gray-600">{event.location}</p>
              <p className="text-gray-600">{event.description}</p>
              <p className="text-gray-600">{event.organization}</p>
              <p className="text-gray-600">{event.category}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedEvents;
