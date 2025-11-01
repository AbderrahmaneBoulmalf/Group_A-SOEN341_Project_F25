jest.mock("../db.js", () => ({
  promise: () => ({
    query: jest
      .fn()
      .mockResolvedValueOnce([[{ ID: 1, Username: "mgr1", Email: "a@e.com" }]])
      .mockResolvedValueOnce([[{ ID: 2, Username: "mgr2", Email: "b@e.com" }]])
      .mockResolvedValueOnce([[{ ID: 3, Username: "mgr3", Email: "c@e.com" }]])
      .mockResolvedValueOnce([{}])
      .mockResolvedValueOnce([{}]),
  }),
}));

import accountManagementController from "../accounts/admins/manageAccounts.js";

//Test for getting manager accounts
describe("Get manager accounts", () => {
  it("Should return the list of active, pending, and disabled manager accounts", async () => {
    const testRequest = {
      session: {
        userId: 1,
        role: "admin",
      },
    };
    const testResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await accountManagementController.getManagerAccounts(
      testRequest as any,
      testResponse as any
    );
    expect(testResponse.status).toHaveBeenCalledWith(200);
    expect(testResponse.json).toHaveBeenCalledWith({
      success: true,
      data: {
        active: expect.any(Array),
        pending: expect.any(Array),
        disabled: expect.any(Array),
      },
    });
  });
});

//Test for deactivating a manager account
describe("Deactivate manager account", () => {
  it("Should deactivate the specified manager account", async () => {
    const testRequest = {
      session: {
        userId: 1,
        role: "admin",
      },
      body: { accountId: 1 },
    };
    const testResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    await accountManagementController.deactivateManagerAccount(
      testRequest as any,
      testResponse as any
    );

    expect(testResponse.status).toHaveBeenCalledWith(200);
    expect(testResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Manager account disabled successfully",
    });
  });
});

//Test for reactivating a manager account
describe("Reactivate manager account", () => {
  it("Should reactivate the specified manager account", async () => {
    const testRequest = {
      session: {
        userId: 1,
        role: "admin",
      },
      body: { accountId: 1 },
    };
    const testResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    await accountManagementController.reactivateManagerAccount(
      testRequest as any,
      testResponse as any
    );

    expect(testResponse.status).toHaveBeenCalledWith(200);
    expect(testResponse.json).toHaveBeenCalledWith({
      success: true,
      message: "Manager account reactivated successfully",
    });
  });
});
