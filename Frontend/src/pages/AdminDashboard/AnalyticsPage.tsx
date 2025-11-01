import { useEffect, useState } from "react";

type AttendancePerEvent = {
  eventId: number;
  title: string;
  capacity: number | null;
  attendance: number;
};

type EventsPerMonth = {
  month: string; // YYYY-MM
  eventsCount: number;
  attendance: number;
};

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState<number>(0);
  const [totalAttendance, setTotalAttendance] = useState<number>(0);
  const [attendancePerEvent, setAttendancePerEvent] = useState<AttendancePerEvent[]>([]);
  const [eventsPerMonth, setEventsPerMonth] = useState<EventsPerMonth[]>([]);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("http://localhost:8787/api/admin/analytics", {
        credentials: "include",
      });

      if (res.status === 401) {
        setError("Not authenticated — please log in as an admin to view analytics.");
        return;
      }
      if (res.status === 403) {
        setError("Forbidden — your account does not have admin privileges.");
        return;
      }

      if (!res.ok) throw new Error(`Status ${res.status}`);
      const data = await res.json();
      if (!data.success) throw new Error("Failed to load analytics");

      setTotalEvents(Number(data.totalEvents || 0));
      setTotalAttendance(Number(data.totalAttendance || 0));
      setAttendancePerEvent((data.attendancePerEvent || []) as AttendancePerEvent[]);
      setEventsPerMonth((data.eventsPerMonth || []) as EventsPerMonth[]);
    } catch (err: any) {
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const avgAttendance =
    attendancePerEvent.length > 0
      ? Math.round((totalAttendance / attendancePerEvent.length) * 100) / 100
      : 0;

  // SVG line chart with simple axes and labels
  const renderTrend = () => {
    if (!eventsPerMonth || eventsPerMonth.length === 0) return null;
    const values = eventsPerMonth.map((r) => Number(r.attendance || 0));
    const max = Math.max(...values, 1);

    const rawWidth = 480;
    const rawHeight = 160;
    const margin = { top: 12, right: 12, bottom: 28, left: 48 };
    const width = rawWidth - margin.left - margin.right;
    const height = rawHeight - margin.top - margin.bottom;

    const stepX = width / Math.max(values.length - 1, 1);

    const points = values
      .map((v, i) => `${margin.left + i * stepX},${margin.top + (height - (v / max) * height)}`)
      .join(" ");

    // Y axis ticks
    const yTickCount = 4;
    const yTicks = Array.from({ length: yTickCount + 1 }, (_, i) =>
      Math.round((max * i) / yTickCount)
    ).reverse();

    // X labels: format month strings like '2024-02' -> 'February'
    const formatMonth = (monthStr: string) => {
      try {
        // Parse YYYY-MM into a Date and format month name only
        const dt = new Date(monthStr + "-01T00:00:00Z");
        return dt.toLocaleString(undefined, { month: "long" });
      } catch {
        return monthStr;
      }
    };

    const xLabelEvery = Math.max(1, Math.ceil(eventsPerMonth.length / 6));

    return (
      <svg width={rawWidth} height={rawHeight} className="border rounded">
        {/* axes lines */}
        <line
          x1={margin.left}
          y1={margin.top}
          x2={margin.left}
          y2={margin.top + height}
          stroke="#cccccc"
        />
        <line
          x1={margin.left}
          y1={margin.top + height}
          x2={margin.left + width}
          y2={margin.top + height}
          stroke="#cccccc"
        />

        {/* y ticks and labels */}
        {yTicks.map((tick, idx) => {
          const y = margin.top + (height * idx) / yTickCount;
          return (
            <g key={tick}>
              <line
                x1={margin.left - 6}
                x2={margin.left}
                y1={y}
                y2={y}
                stroke="#999"
              />
              <text x={margin.left - 10} y={y + 4} fontSize={11} textAnchor="end" fill="#444">
                {tick}
              </text>
              {/* grid line */}
              <line
                x1={margin.left}
                x2={margin.left + width}
                y1={y}
                y2={y}
                stroke="#eee"
              />
            </g>
          );
        })}

        {/* x labels */}
        {eventsPerMonth.map((r, i) => {
          if (i % xLabelEvery !== 0 && i !== eventsPerMonth.length - 1) return null;
          const x = margin.left + i * stepX;
          const label = formatMonth(r.month);
          return (
            <g key={r.month}>
              <line x1={x} x2={x} y1={margin.top + height} y2={margin.top + height + 6} stroke="#999" />
              <text
                x={x}
                y={margin.top + height + 18}
                fontSize={11}
                textAnchor="middle"
                fill="#444"
              >
                {label}
              </text>
            </g>
          );
        })}

        {/* line */}
        <polyline fill="none" stroke="#2563eb" strokeWidth={2} points={points} />
      </svg>
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Platform Analytics</h2>
      {loading && <div>Loading analytics…</div>}

      {error && (
        <div className="space-y-3">
          <div className="text-red-600">Error: {error}</div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 bg-blue-600 text-white rounded"
              onClick={() => (window.location.href = "/login")}
            >
              Go to login
            </button>
            <button
              className="px-3 py-1 border rounded"
              onClick={() => fetchAnalytics()}
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500">Total events</div>
              <div className="text-2xl font-bold">{totalEvents}</div>
            </div>
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500">Total attendance</div>
              <div className="text-2xl font-bold">{totalAttendance}</div>
            </div>
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500">Avg attendance / event</div>
              <div className="text-2xl font-bold">{avgAttendance}</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Participation trends (attendance by month)</h3>
            <div className="mt-2">{renderTrend()}</div>
            <div className="mt-2 text-sm text-gray-600">Showing last {eventsPerMonth.length} months</div>
          </div>

          <div>
            <h3 className="text-lg font-medium">Top events by attendance</h3>
            <div className="mt-2 overflow-auto">
              <table className="w-full text-left table-auto border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-2 py-1">Event</th>
                    <th className="px-2 py-1">Attendance</th>
                    <th className="px-2 py-1">Capacity</th>
                  </tr>
                </thead>
                <tbody>
                  {attendancePerEvent.map((e) => (
                    <tr key={e.eventId} className="border-t">
                      <td className="px-2 py-1">{e.title}</td>
                      <td className="px-2 py-1">{e.attendance}</td>
                      <td className="px-2 py-1">{e.capacity ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
