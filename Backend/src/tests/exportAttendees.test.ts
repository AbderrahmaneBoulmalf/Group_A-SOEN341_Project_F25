import type { Request, Response } from "express";

jest.mock("../db.js", () => ({
  __esModule: true,
  default: {
    promise: jest.fn(),
  },
}));

import db from "../db.js";
import exportEventAttendeesCsv from "../events/exportAttendees.js";

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
  send: jest.Mock;
  setHeader: jest.Mock;
};

const createMockResponse = (): Response & MockResponse => {
  const res: Partial<Response> & MockResponse = {
    status: jest.fn(),
    json: jest.fn(),
    send: jest.fn(),
    setHeader: jest.fn(),
  };

  res.status.mockReturnValue(res as Response & MockResponse);
  res.json.mockReturnValue(res as Response & MockResponse);
  res.send.mockReturnValue(res as Response & MockResponse);

  return res as Response & MockResponse;
};

const mockedPromise = db.promise as unknown as jest.Mock;

let mockQuery: jest.Mock;

beforeEach(() => {
  mockQuery = jest.fn();
  mockedPromise.mockReset();
  mockedPromise.mockReturnValue({ query: mockQuery });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("exportEventAttendeesCsv", () => {
  it("returns 400 when event id is invalid", async () => {
    const req = { params: { eventId: "invalid" } } as unknown as Request;
    const res = createMockResponse();

    await exportEventAttendeesCsv(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid event id parameter",
    });
    expect(mockedPromise).not.toHaveBeenCalled();
  });

  it("returns 404 when event is not found", async () => {
    mockQuery.mockResolvedValueOnce([[]]);

    const req = { params: { eventId: "42" } } as unknown as Request;
    const res = createMockResponse();

    await exportEventAttendeesCsv(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Event not found",
    });
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });

  it("sends a CSV file when attendees are found", async () => {
    mockQuery
      .mockResolvedValueOnce([[{ id: 7, title: "Test Event" }]])
      .mockResolvedValueOnce([
        [
          {
            ticketId: 101,
            studentId: 55,
            username: 'Doe, "Jane"',
            email: "jane@example.com",
          },
        ],
      ]);

    const req = { params: { eventId: "7" } } as unknown as Request;
    const res = createMockResponse();

    await exportEventAttendeesCsv(req, res);

    expect(res.setHeader).toHaveBeenNthCalledWith(
      1,
      "Content-Type",
      "text/csv; charset=utf-8"
    );
    expect(res.setHeader).toHaveBeenNthCalledWith(
      2,
      "Content-Disposition",
      'attachment; filename="event-7-attendees.csv"'
    );
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.send).toHaveBeenCalledWith(
      [
        "Ticket ID,Student ID,Username,Email",
        '101,55,"Doe, ""Jane""",jane@example.com',
      ].join("\r\n")
    );
  });

  it("returns 500 when the database query fails", async () => {
    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});

    mockQuery.mockRejectedValueOnce(new Error("DB failure"));

    const req = { params: { eventId: "9" } } as unknown as Request;
    const res = createMockResponse();

    await exportEventAttendeesCsv(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Failed to export attendees",
    });
    expect(consoleErrorSpy).toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });
});
