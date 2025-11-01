/**
 * Purpose of this unit test:
 *  - Insert a new pass with basic validation (valid=1)
 *  - Verify a pass (returns details once, then becomes invalid/used)
 *  - Lookup an existing valid pass for (user_id, event_id)
 *  - Return proper errors/flags for invalid input or used/missing passes
 */

type Pass = {
  passID: string;
  user_id: number;
  event_id: number;
  valid: 0 | 1;
};

class MockPassHandling {
  private passes = new Map<string, Pass>();
  clear() {
    this.passes.clear();
  }

  //Simulation of POST /internal/passes
  async insertPass(passKey: string, user_id: number, event_id: number) {
    if (
      !passKey ||
      typeof passKey !== "string" ||
      !Number.isInteger(user_id) ||
      !Number.isInteger(event_id)
    ) {
      const err = new Error("Invalid payload - Pass values not valid!");
      // @ts-ignore
      err.status = 400;
      throw err;
    }

    const row: Pass = {
      passID: passKey,
      user_id: user_id as number,
      event_id: event_id as number,
      valid: 1,
    };
    this.passes.set(passKey, row);
    return { ok: true };
  }
  //Simulation of POST /internal/verify
  async verify(pass: unknown) {
    if (typeof pass !== "string" || pass.length === 0) {
      const err: any = new Error("Bad pass value");
      err.status = 400;
      throw err;
    }

    const row = this.passes.get(pass);
    if (!row || row.valid !== 1) {
      return { valid: false };
    }

    row.valid = 0;
    this.passes.set(pass, row);

    return { valid: true, user_id: row.user_id, event_id: row.event_id };
  }

  //Simulation of GET /internal/getPasses
  async getPasses(user_id: unknown, event_id: unknown) {
    if (!Number.isInteger(user_id) || !Number.isInteger(event_id)) {
      const err: any = new Error("user_id and event_id must be integers");
      err.status = 400;
      throw err;
    }
    const uid = user_id as number;
    const eid = event_id as number;

    for (const row of this.passes.values()) {
      if (row.user_id === uid && row.event_id === eid && row.valid === 1) {
        return {
          exists: true as const,
          pass: row.passID,
          user_id: row.user_id,
          event_id: row.event_id,
          valid: row.valid,
        };
      }
    }
    // Not found or currently invalid
    const res = { exists: false as const };
    return res;
  }
}
// ----------------- Tests -----------------

describe("MockPassService behavior (no DB, no Express)", () => {
  const svc = new MockPassHandling();

  afterEach(() => svc.clear());

  // INSERT

  test("Insert: valid payload -> stores a valid pass", async () => {
    const res = await svc.insertPass("p_abc", 9, 3);
    expect(res).toEqual({ ok: true });

    const lookup = await svc.getPasses(9, 3);
    expect(lookup).toEqual({
      exists: true,
      pass: "p_abc",
      user_id: 9,
      event_id: 3,
      valid: 1,
    });
  });

  test("Insert: invalid payload -> throws 400", async () => {
    await expect(
      svc.insertPass(123 as any, "x" as any, 3)
    ).rejects.toMatchObject({
      message: "Invalid payload - Pass values not valid!",
      status: 400,
    });
  });

  // VERIFY

  test("Verify: unknown pass -> {valid:false}", async () => {
    const res = await svc.verify("does_not_exist");
    expect(res).toEqual({ valid: false });
  });

  test("Verify: bad pass value -> throws 400", async () => {
    await expect(svc.verify("")).rejects.toMatchObject({
      message: "Bad pass value",
      status: 400,
    });
  });

  test("Verify: valid pass first time -> returns details and marks used", async () => {
    await svc.insertPass("p_once", 42, 7);

    const first = await svc.verify("p_once");
    expect(first).toEqual({ valid: true, user_id: 42, event_id: 7 });

    // Second time should be invalid
    const second = await svc.verify("p_once");
    expect(second).toEqual({ valid: false });

    // And getPasses should not see it anymore
    const lookup = await svc.getPasses(42, 7);
    expect(lookup).toEqual({ exists: false });
  });

  // GET PASSES

  test("getPasses: existing valid -> exists:true with row", async () => {
    await svc.insertPass("p_live", 9, 3);
    const res = await svc.getPasses(9, 3);
    expect(res).toEqual({
      exists: true,
      pass: "p_live",
      user_id: 9,
      event_id: 3,
      valid: 1,
    });
  });

  test("getPasses: none found -> exists:false", async () => {
    const res = await svc.getPasses(1, 2);
    expect(res).toEqual({ exists: false });
  });

  test("getPasses: non-integer inputs -> throws 400", async () => {
    await expect(svc.getPasses("abc" as any, 3)).rejects.toMatchObject({
      message: "user_id and event_id must be integers",
      status: 400,
    });
  });
});
