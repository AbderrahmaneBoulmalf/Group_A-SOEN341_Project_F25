import type { Request, Response, NextFunction } from "express";
import ensureActiveManager from "../middleware/ensureActiveManager.js";


const mockQuery = jest.fn();
jest.mock("../db.js", () => ({
  __esModule: true,
  default: {
    promise: () => ({ query: mockQuery }),
  },
}));


const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {};
  (res.status as any) = jest.fn().mockReturnValue(res);
  (res.json as any) = jest.fn().mockReturnValue(res);
  return res;
};
const mockNext = () => jest.fn() as jest.MockedFunction<NextFunction>;

describe("ensureActiveManager middleware", () => {
  beforeEach(() => {
    mockQuery.mockReset();
  });

  it("403 if role is not manager", async () => {
    const req = { session: { role: "student", userId: 123 } } as unknown as Request;
    const res = mockResponse() as Response;
    const next = mockNext();

    await ensureActiveManager(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Insufficient role" });
    expect(next).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("401 if not authenticated (no userId)", async () => {
    const req = { session: { role: "manager" } } as unknown as Request;
    const res = mockResponse() as Response;
    const next = mockNext();

    await ensureActiveManager(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Not authenticated" });
    expect(next).not.toHaveBeenCalled();
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it("403 pending if Status !== 1 (e.g., 0)", async () => {
    mockQuery.mockResolvedValueOnce([[{ Status: 0 }]]);

    const req = { session: { role: "manager", userId: 7 } } as unknown as Request;
    const res = mockResponse() as Response;
    const next = mockNext();

    await ensureActiveManager(req, res, next);

    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Manager approval pending" });
    expect(next).not.toHaveBeenCalled();
  });

  it("403 denied if Status === 2", async () => {
    mockQuery.mockResolvedValueOnce([[{ Status: 2 }]]);

    const req = { session: { role: "manager", userId: 7 } } as unknown as Request;
    const res = mockResponse() as Response;
    const next = mockNext();

    await ensureActiveManager(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Manager access denied" });
    expect(next).not.toHaveBeenCalled();
  });

  it("calls next() if Status === 1", async () => {
    mockQuery.mockResolvedValueOnce([[{ Status: 1 }]]);

    const req = { session: { role: "manager", userId: 7 } } as unknown as Request;
    const res = mockResponse() as Response;
    const next = mockNext();

    await ensureActiveManager(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
