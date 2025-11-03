import { Request, Response } from "express";
import db from "../db.js"; 
import events from "../events/events.js";

jest.mock("../db", () => ({
  promise: jest.fn(),
}));

describe("getEventAnalytics", () => {
  let mockReq: Partial<Request>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRes = {
      json: jsonMock,
      status: statusMock,
    };

    (db.promise as jest.Mock).mockReturnValue({
      query: jest.fn(),
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if event ID is invalid", async () => {
    mockReq = { params: { id: "abc" } };

    await events.getEventAnalytics(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith({ error: "Invalid event ID" });
  });

  it("should return analytics correctly when data is valid", async () => {
    mockReq = { params: { id: "5" } };

    const mockQuery = jest
      .fn()
      // First query: tickets sold
      .mockResolvedValueOnce([[{ ticketsSold: 10 }]])
      // Second query: event info
      .mockResolvedValueOnce([[{ price: 20, capacity: 100 }]]);

    (db.promise as jest.Mock).mockReturnValue({ query: mockQuery });

    await events.getEventAnalytics(mockReq as Request, mockRes as Response);

    expect(mockQuery).toHaveBeenCalledTimes(2);
    expect(jsonMock).toHaveBeenCalledWith({
      ticketsSold: 10,
      attendance: 10,
      revenue: 200,
      capacity: 100,
    });
  });

  it("should handle database errors gracefully", async () => {
    mockReq = { params: { id: "2" } };

    const mockQuery = jest.fn().mockRejectedValueOnce(new Error("DB fail"));
    (db.promise as jest.Mock).mockReturnValue({ query: mockQuery });

    await events.getEventAnalytics(mockReq as Request, mockRes as Response);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith({
      error: "Failed to fetch analytics",
    });
  });
});
