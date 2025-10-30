/**
 * Purpose of this unit test:
 *  - Accept valid payment data and create a claimed ticket
 *  - Reject invalid payment data
 *  - Prevent duplicate claims by the same student for the same event
 */

type Payment = {
  name: string;
  card: string;
  exp: string;
  cvv: string;
};

type ClaimedTicket = {
  ticketId: number;
  studentId: number;
  eventId: number;
  claimedAt: number;
  payment?: Payment;
};

class MockPaymentService {
  private tickets = new Map<string, ClaimedTicket>();
  private nextTicketId = 1;

  // Small validation rules to match the tests...
  private validatePayment(payment: Payment) {
    if (!payment) throw new Error("Missing payment");
    if (!payment.name || !payment.exp) throw new Error("Invalid payment info");
    const cardDigits = payment.card.replace(/\s+/g, "");
    if (cardDigits.length < 12) throw new Error("Invalid card number");
    if (payment.cvv.length < 3) throw new Error("Invalid cvv");
  }

  // Simulate the pay-and-claim operation (throws on validation or duplicates)
  async payAndClaim(studentId: number, eventId: number, payment: Payment) {
    // Basic param validation
    if (!studentId || !eventId) {
      const err = new Error("Missing student or event id");
      // @ts-ignore add status for tests to inspect
      err.status = 400;
      throw err;
    }

    // Validate payment details
    try {
      this.validatePayment(payment);
    } catch (e: any) {
      const err = new Error(e.message || "Invalid payment");
      // @ts-ignore
      err.status = 400;
      throw err;
    }

    const key = `${studentId}:${eventId}`;
    if (this.tickets.has(key)) {
      const err = new Error("Event already claimed by this student");
      // @ts-ignore
      err.status = 409;
      throw err;
    }

    const t: ClaimedTicket = {
      ticketId: this.nextTicketId++,
      studentId,
      eventId,
      claimedAt: Date.now(),
      payment,
    };
    this.tickets.set(key, t);
    return { success: true, ticket: t };
  }

  getClaimed(studentId: number, eventId: number) {
    return this.tickets.get(`${studentId}:${eventId}`) || null;
  }

  clear() {
    this.tickets.clear();
    this.nextTicketId = 1;
  }
}

// Actual tests:

describe("MockPaymentService pay-and-claim behavior", () => {
  const svc = new MockPaymentService();

  afterEach(() => {
    svc.clear();
  });

  test("Valid payment -> creates a claimed ticket", async () => {
    const studentId = 1001;
    const eventId = 2002;
    const payment: Payment = {
      name: "Alice Example",
      card: "4242 4242 4242", // 12+ digits
      exp: "12/30",
      cvv: "123",
    };

    const res = await svc.payAndClaim(studentId, eventId, payment);
    expect(res).toBeDefined();
    expect(res.success).toBe(true);
    expect(res.ticket).toBeDefined();
    expect(res.ticket.studentId).toBe(studentId);
    expect(res.ticket.eventId).toBe(eventId);
    expect(typeof res.ticket.ticketId).toBe("number");

    // Verify internal storage
    const stored = svc.getClaimed(studentId, eventId);
    expect(stored).not.toBeNull();
    expect(stored!.ticketId).toBe(res.ticket.ticketId);
    expect(stored!.payment!.name).toBe("Alice Example");
  });

  test("Invalid payment -> rejects with 400 when card number is too short", async () => {
    const studentId = 5;
    const eventId = 6;
    const badPayment: Payment = {
      name: "Bob",
      card: "1234", // too short
      exp: "01/25",
      cvv: "999",
    };

    await expect(
      svc.payAndClaim(studentId, eventId, badPayment)
    ).rejects.toMatchObject({
      message: "Invalid card number",
      status: 400,
    });
  });

  test("Duplicate claim -> second attempt returns 409 / does not create a duplicate", async () => {
    const studentId = 77;
    const eventId = 88;
    const payment: Payment = {
      name: "Carol",
      card: "5555 5555 5555 5555",
      exp: "10/29",
      cvv: "321",
    };

    // First attempt should succeed
    const first = await svc.payAndClaim(studentId, eventId, payment);
    expect(first.success).toBe(true);
    const storedBefore = svc.getClaimed(studentId, eventId);
    expect(storedBefore).not.toBeNull();
    const firstTicketId = storedBefore!.ticketId;

    // Second attempt should throw a 409 conflict and not create a new ticket
    await expect(
      svc.payAndClaim(studentId, eventId, payment)
    ).rejects.toMatchObject({
      message: "Event already claimed by this student",
      status: 409,
    });

    // Ensure no duplicate was created (ticketId remains the same)
    const storedAfter = svc.getClaimed(studentId, eventId);
    expect(storedAfter).not.toBeNull();
    expect(storedAfter!.ticketId).toBe(firstTicketId);
  });
});
