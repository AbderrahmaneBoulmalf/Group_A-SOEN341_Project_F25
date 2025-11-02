
type User = {
    id: number;
    role: "student" | "manager" | "admin";
    manager?: { status: 0 | 1 | 2 };
  };
  
  function ensureActiveManager(req: any, res: any, next: Function) {
    const user: User | undefined = req.user;
    if (!user || user.role !== "manager") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const st = user.manager?.status;
    if (st === 1) return next();
    if (st === 0)
      return res.status(403).json({ error: "Manager account pending approval" });
    if (st === 2)
      return res.status(403).json({ error: "Manager account declined" });
    return res.status(403).json({ error: "Forbidden" });
  }
  
  const makeRes = () => {
    const out: any = { code: 0, body: null };
    return {
      status(c: number) {
        out.code = c;
        return {
          json(b: any) {
            out.body = b;
            return out;
          },
        };
      },
      _out: out,
    };
  };
  
  describe("ensureActiveManager middleware (status 0/1/2)", () => {
    test("Approved manager (1) -> calls next()", () => {
      const req = { user: { id: 1, role: "manager", manager: { status: 1 } } };
      const res = makeRes();
      let called = false;
      ensureActiveManager(req, res, () => {
        called = true;
      });
      expect(called).toBe(true);
      expect(res._out.code).toBe(0); 
    });
  
    test("Pending manager (0) -> 403 + message", () => {
      const req = { user: { id: 2, role: "manager", manager: { status: 0 } } };
      const res = makeRes();
      ensureActiveManager(req, res, () => {});
      expect(res._out.code).toBe(403);
      expect(res._out.body).toEqual({
        error: "Manager account pending approval",
      });
    });
  
    test("Declined manager (2) -> 403 + message", () => {
      const req = { user: { id: 3, role: "manager", manager: { status: 2 } } };
      const res = makeRes();
      ensureActiveManager(req, res, () => {});
      expect(res._out.code).toBe(403);
      expect(res._out.body).toEqual({ error: "Manager account declined" });
    });
  
    test("Non-manager role -> 403", () => {
      const req = { user: { id: 4, role: "student" } };
      const res = makeRes();
      ensureActiveManager(req, res, () => {});
      expect(res._out.code).toBe(403);
      expect(res._out.body).toEqual({ error: "Forbidden" });
    });
  
    test("Missing user -> 403", () => {
      const req = {};
      const res = makeRes();
      ensureActiveManager(req as any, res, () => {});
      expect(res._out.code).toBe(403);
      expect(res._out.body).toEqual({ error: "Forbidden" });
    });
  });
  