module.exports = class ErrorHandler {
  generateError({ error, message, status }) {
    if (error) {
      error = new Error(error);
    }

    if (!error) {
      error = new Error(message);
    } else if (error && message) {
      error.message = message;
      error.originalErrorMessage = error.message;
    }

    error.status = status || error.status || 500;
    error.stack = error.stack;
    return error;
  }
};
