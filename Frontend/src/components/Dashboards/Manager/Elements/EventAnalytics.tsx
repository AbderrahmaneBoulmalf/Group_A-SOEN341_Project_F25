import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface EventAnalyticsData {
  ticketsSold: number;
  attendance: number;
  revenue: number;
  capacity: number;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#FF6666"];

const EventAnalytics: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<EventAnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8787/manager/event/${id}/analytics`,
          { withCredentials: true }
        );
        setData(response.data);
      } catch (err) {
        console.error("Failed to load analytics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [id]);

  if (loading) return <p>Loading analytics...</p>;
  if (!data) return <p>No analytics available for this event.</p>;

  return (
    <div className="ml-4 mr-4 mt-4">
      <h2 className="text-2xl font-bold mb-6">Event Analytics</h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-4 bg-white shadow rounded text-center">
          <p className="text-sm text-gray-500">Tickets Sold</p>
          <p className="text-xl font-bold">{data.ticketsSold}</p>
        </div>
        <div className="p-4 bg-white shadow rounded text-center">
          <p className="text-sm text-gray-500">Attendance</p>
          <p className="text-xl font-bold">{data.attendance}</p>
        </div>
        <div className="p-4 bg-white shadow rounded text-center">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-xl font-bold">${data.revenue}</p>
        </div>
      </div>

      {/* Attendance vs Capacity */}
      <div className="mb-8 p-4 bg-white shadow rounded">
        <h3 className="text-lg font-semibold mb-4">Attendance vs Capacity</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={[
                { name: "Attended", value: data.attendance },
                {
                  name: "Remaining",
                  value: Math.max((data.capacity || 0) - data.attendance, 0),
                },
              ]}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label={({ name, percent }) =>
                `${name}: ${(percent * 100).toFixed(0)}%`
              }
            >
              <Cell fill="#00C49F" /> {/* Attended */}
              <Cell fill="#FF8042" /> {/* Remaining */}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EventAnalytics;
