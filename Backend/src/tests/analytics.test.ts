jest.mock("../analytics/analytics.js", () => ({
  default: {
    getTotalEvents: jest.fn(async () => 3),
    getAttendanceByEvent: jest.fn(async () => [
      { id: 1, title: "Event A", attendees: 2 },
      { id: 2, title: "Event B", attendees: 0 },
    ]),
    getParticipationTrends: jest.fn(async () => [
      { month: "2025-09", attendees: 5 },
      { month: "2025-10", attendees: 7 },
    ]),
  },
}));

const mockedModule = jest.requireMock("../analytics/analytics.js") as any;
const mocked = mockedModule.default as any;

describe("Analytics service (mocked)", () => {
  test("returns total number of events", async () => {
  const total = await mocked.getTotalEvents();
  expect(total).toBe(3);
  });

  test("returns attendance per event", async () => {
  const rows = await mocked.getAttendanceByEvent();
    expect(Array.isArray(rows)).toBe(true);
    expect(rows.length).toBeGreaterThanOrEqual(1);
    expect(rows[0]).toMatchObject({ id: 1, title: "Event A", attendees: 2 });
  });

  test("returns participation trends", async () => {
  const trends = await mocked.getParticipationTrends();
    expect(trends).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ month: "2025-09", attendees: 5 }),
      ])
    );
  });
});