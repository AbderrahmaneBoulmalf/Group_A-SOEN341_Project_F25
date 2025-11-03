

import type { Request, Response, NextFunction } from "express";

let mQuery: jest.Mock;
let mExecute: jest.Mock;

jest.mock("../db.js", () => {
  mQuery = jest.fn();
  mExecute = jest.fn();
  return {
    __esModule: true,
    default: {
      promise: () => ({ query: mQuery, execute: mExecute }),
    },
  };
});

import adminOrganizersRouter from "../accounts/adminOrganizers.js";

const makeRes = (): Partial<Response> => {
  const res: Partial<Response> = {};
  (res.status as any) = jest.fn().mockReturnValue(res);
  (res.json as any) = jest.fn().mockReturnValue(res);
  return res;
};

type Handler = (req: Request, res: Response, next: NextFunction) => any;

type _ExpressLayer = {
  route?: {
    path: string;
    methods: Record<string, boolean>;
    stack: Array<{ handle: Handler }>;
  };
};

function getHandler(method: "get" | "post", path: string): Handler {
  const stack = (adminOrganizersRouter as unknown as { stack: _ExpressLayer[] }).stack;
  const layer = stack.find(
    (l) => l.route && l.route.path === path && l.route.methods[method]
  );
  if (!layer || !layer.route) {
    throw new Error(`Route ${method.toUpperCase()} ${path} not found`);
  }
  return (layer.route.stack[0].handle as unknown) as Handler;
}

describe("Admin organizers routes", () => {
  beforeEach(() => {
    mQuery.mockReset();
    mExecute.mockReset();
  });

  it("GET /pending -> returns 200 and users array", async () => {
    mQuery.mockResolvedValue([
      [
        { ID: 9, Username: "m1", Email: "m1@x", Role: "manager", Status: 0 },
        { ID: 12, Username: "m2", Email: "m2@x", Role: "manager", Status: 0 },
      ],
    ]);

    const req = {} as Request;
    const res = makeRes() as Response;
    const next = jest.fn();

    await getHandler("get", "/pending")(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      users: expect.any(Array),
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("POST /:id/approve -> 200 and executes update", async () => {
    mExecute.mockResolvedValue([{}]);

    const req = { params: { id: "18" } } as unknown as Request;
    const res = makeRes() as Response;
    const next = jest.fn();

    await getHandler("post", "/:id/approve")(req, res, next);

    expect(mExecute).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(next).not.toHaveBeenCalled();
  });

  it("POST /:id/reject -> 200 and executes update", async () => {
    mExecute.mockResolvedValue([{}]);

    const req = { params: { id: "22" } } as unknown as Request;
    const res = makeRes() as Response;
    const next = jest.fn();

    await getHandler("post", "/:id/reject")(req, res, next);

    expect(mExecute).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
    expect(next).not.toHaveBeenCalled();
  });
});
