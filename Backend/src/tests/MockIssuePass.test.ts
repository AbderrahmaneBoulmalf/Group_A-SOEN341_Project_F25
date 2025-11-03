/**
 * Purpose of this unit test:
 *  - Return existing pass if found
 *  - Create new pass if none exists
 *  - Return 400 for bad input
 */

class MockIssuePassService {
  private existingPasses = new Map<string, string>(); // key: "user:event"

  clear() {
    this.existingPasses.clear();
  }

  async issuePass(eventId: any, userId: any) {
    // Basic input validation
    if (!Number.isInteger(eventId) || !Number.isInteger(userId)) {
      const err: any = new Error("bad_input");
      err.status = 400;
      throw err;
    }

    const key = `${userId}:${eventId}`;
    if (this.existingPasses.has(key)) {
      // Existing pass found
      return { status: 200, passId: this.existingPasses.get(key)! };
    }

    // No existing pass, create a new one
    const newPass = "p_" + Math.random().toString(36).slice(2, 8);
    this.existingPasses.set(key, newPass);
    return { status: 201, passId: newPass };
  }
}

// ---------------- TESTS ----------------
describe("MockIssuePassService basic behavior", () => {
  const svc = new MockIssuePassService();

  afterEach(() => svc.clear());

  test("Existing pass -> returns 200 and same passId", async () => {
    // Arrange
    const user = 10;
    const event = 5;
    const passId = "p_demo";
    svc["existingPasses"].set(`${user}:${event}`, passId);

    // Act
    const res = await svc.issuePass(event, user);

    // Assert
    expect(res.status).toBe(200);
    expect(res.passId).toBe(passId);
  });

  test("No existing pass -> creates new one (201)", async () => {
    const user = 7;
    const event = 2;

    const res = await svc.issuePass(event, user);

    expect(res.status).toBe(201);
    expect(res.passId.startsWith("p_")).toBe(true);
  });

  test("Bad input (non-integer) -> throws 400", async () => {
    await expect(svc.issuePass("abc" as any, 1)).rejects.toMatchObject({
      message: "bad_input",
      status: 400,
    });
  });
});
