module.exports = class ErrorHandler {
  generateError(error, message, status) {
    const stack = error.stack;
    const originalErrorMessage = error.message;
    return {
      ...error,
      status: status || 500,
      message,
      originalErrorMessage,
      stack,
    };
  }
};
