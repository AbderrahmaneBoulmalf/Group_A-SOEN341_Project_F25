import request from "supertest";
import express from "express";

// IMPORTANT: Your router has a **default export** and we are in ESM.
// So tests must import with the .js extension.
import adminOrganizers from "../accounts/adminOrganizers.js";

// We need to mock the mysql wrapper used by adminOrganizers.ts
// We'll expose the underlying jest fns on the default export so the test can control them.
jest.mock("../db.js", () => {
  const query = jest.fn();
  const execute = jest.fn();
  const db = { promise: () => ({ query, execute }) };
  // expose for tests
  (db as any).__query = query;
  (db as any).__execute = execute;
  return { __esModule: true, default: db };
});

// @ts-ignore - we only need access to the mocked internals
import db from "../db.js";

const app = express();
app.use(express.json());
// mount exactly how your server would: base path /admin/organizers + router
app.use("/admin/organizers", adminOrganizers);

describe("Admin organizers routes", () => {
  beforeEach(() => {
    const q = (db as any).__query as jest.Mock;
    const ex = (db as any).__execute as jest.Mock;
    q.mockReset();
    ex.mockReset();
  });

  test("GET /pending -> returns 200 and users array", async () => {
    const q = (db as any).__query as jest.Mock;
    q.mockResolvedValueOnce([
      [
        { ID: 1, Username: "m1", Email: "m1@example.com", Role: "manager", Status: 0 },
        { ID: 2, Username: "m2", Email: "m2@example.com", Role: "manager", Status: 0 },
      ],
    ]);

    const res = await request(app).get("/admin/organizers/pending");

    expect(res.status).toBe(200);
    // Your code responds with { success: true, users: rows ?? [] }
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users).toHaveLength(2);
  });

  test("POST /:id/approve -> 200 and executes update", async () => {
    const ex = (db as any).__execute as jest.Mock;
    ex.mockResolvedValueOnce([{}]); // simulate successful update

    const res = await request(app).post("/admin/organizers/10/approve");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(ex).toHaveBeenCalledWith("UPDATE Users SET Status=1 WHERE ID=? AND Role='manager'", [10]);
  });

  test("POST /:id/reject -> 200 and executes update", async () => {
    const ex = (db as any).__execute as jest.Mock;
    ex.mockResolvedValueOnce([{}]); // simulate successful update

    const res = await request(app).post("/admin/organizers/22/reject");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(ex).toHaveBeenCalledWith("UPDATE Users SET Status=2 WHERE ID=? AND Role='manager'", [22]);
  });
});
