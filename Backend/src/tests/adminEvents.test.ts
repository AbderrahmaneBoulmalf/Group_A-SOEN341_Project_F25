import type { Request, Response } from "express";

jest.mock("../db.js", () => ({
  __esModule: true,
  default: {
    promise: jest.fn(),
  },
}));

import db from "../db.js";
import adminEvents from "../events/adminEvents.js";

type MockResponse = {
  status: jest.Mock;
  json: jest.Mock;
};

const createMockResponse = (): Response & MockResponse => {
  const res: Partial<Response> & MockResponse = {
    status: jest.fn(),
    json: jest.fn(),
  };

  res.status.mockReturnValue(res as Response & MockResponse);
  res.json.mockReturnValue(res as Response & MockResponse);

  return res as Response & MockResponse;
};

const mockedPromise = db.promise as unknown as jest.Mock;

let getConnectionMock: jest.Mock;
let connection: {
  query: jest.Mock;
  beginTransaction: jest.Mock;
  commit: jest.Mock;
  rollback: jest.Mock;
  release: jest.Mock;
};

beforeEach(() => {
  connection = {
    query: jest.fn(),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
    release: jest.fn(),
  };

  getConnectionMock = jest.fn().mockResolvedValue(connection);

  mockedPromise.mockReset();
  mockedPromise.mockReturnValue({
    getConnection: getConnectionMock,
  });
});

afterEach(() => {
  jest.clearAllMocks();
});

describe("adminEvents.deleteEvent", () => {
  it("returns 400 for an invalid event id", async () => {
    const req = { params: { eventId: "abc" } } as unknown as Request;
    const res = createMockResponse();

    await adminEvents.deleteEvent(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Invalid event id",
    });
    expect(mockedPromise).not.toHaveBeenCalled();
  });

  it("returns 404 when the target event does not exist", async () => {
    connection.query
      .mockResolvedValueOnce([{}]) // ClaimedTickets
      .mockResolvedValueOnce([{}]) // SavedEvents
      .mockResolvedValueOnce([{ affectedRows: 0 }]); // events delete

    const req = { params: { eventId: "42" } } as unknown as Request;
    const res = createMockResponse();

    await adminEvents.deleteEvent(req, res);

    expect(getConnectionMock).toHaveBeenCalled();
    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.rollback).toHaveBeenCalledTimes(1);
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Event not found",
    });
  });

  it("deletes the event and related data successfully", async () => {
    connection.query
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{ affectedRows: 1 }]);

    const req = { params: { eventId: "5" } } as unknown as Request;
    const res = createMockResponse();

    await adminEvents.deleteEvent(req, res);

    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.query).toHaveBeenNthCalledWith(
      1,
      "DELETE FROM ClaimedTickets WHERE event_id = ?",
      [5]
    );
    expect(connection.query).toHaveBeenNthCalledWith(
      2,
      "DELETE FROM SavedEvents WHERE EventID = ?",
      [5]
    );
    expect(connection.query).toHaveBeenNthCalledWith(
      3,
      "DELETE FROM events WHERE id = ?",
      [5]
    );
    expect(connection.commit).toHaveBeenCalled();
    expect(connection.rollback).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
  });

  it("returns 500 when a database error occurs and rolls back the transaction", async () => {
    const error = new Error("db exploded");
    connection.query.mockRejectedValueOnce(error);

    const req = { params: { eventId: "7" } } as unknown as Request;
    const res = createMockResponse();

    await adminEvents.deleteEvent(req, res);

    expect(connection.beginTransaction).toHaveBeenCalled();
    expect(connection.rollback).toHaveBeenCalled();
    expect(connection.commit).not.toHaveBeenCalled();
    expect(connection.release).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: "Failed to delete event",
        error: "db exploded",
      })
    );
  });
});

