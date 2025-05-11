const ErrorHandler = require("../../src/utils/error-handler");

describe("ErrorHandler", () => {
  let errorHandler;

  beforeEach(() => {
    errorHandler = new ErrorHandler();
  });

  it("should generate an error with a custom message", () => {
    const error = errorHandler.generateError({
      message: "Test Error",
      status: 400,
    });
    expect(error.message).toBe("Test Error");
    expect(error.status).toBe(400);
  });

  it("should wrap an existing error with a new message", () => {
    const originalError = new Error("Original Error");
    const error = errorHandler.generateError({
      error: originalError,
      message: "New Error",
    });

    expect(error.message).toBe("New Error");
    expect(error.originalError).toBe(originalError);
  });

  it("should preserve existing error stack and status if no message is provided", () => {
    const originalError = new Error("Original");
    originalError.stack = "original-stack";
    originalError.status = 403;

    const error = errorHandler.generateError({ error: originalError });

    expect(error.stack).toBe("original-stack");
    expect(error.status).toBe(403);
    expect(error.message).toBe("Original");
  });

  it("should set status to 500 if none is provided", () => {
    const error = errorHandler.generateError({ message: "Server Error" });

    expect(error.status).toBe(500);
  });

  it("should handle missing message and error gracefully", () => {
    const error = errorHandler.generateError({});

    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBeFalsy();
    expect(error.status).toBe(500);
  });
});
