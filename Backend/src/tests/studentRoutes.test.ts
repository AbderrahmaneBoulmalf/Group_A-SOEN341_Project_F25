//Mock database and its responses
jest.mock("../db.js", () => ({
  promise: () => ({
    query: jest
      .fn()
      .mockResolvedValueOnce([[{ event_id: 1 }, { event_id: 2 }]])
      .mockResolvedValueOnce([
        [
          { title: "Event 1", date: "2025-10-30" },
          { title: "Event 2", date: "2025-10-31" },
        ],
      ]),
  }),
}));

import studentEventsController from "../accounts/students/events.js";

//Test for getting student calendar events
describe("Get student calendar events", () => {
  it("should return the list of claimed tickets with title and date for the specified student", async () => {
    const testRequest = {
      session: {
        userId: 1,
        role: "student",
      },
    };

    const testResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await studentEventsController.getCalendarEvents(
      testRequest as any,
      testResponse as any
    );

    expect(testResponse.status).toHaveBeenCalledWith(200);
    expect(testResponse.json).toHaveBeenCalledWith({
      success: true,
      events: expect.any(Array),
    });
  });
});
