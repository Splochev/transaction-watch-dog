module.exports = class ErrorHandler {
  generateError({ error, message, status }) {
    let tempStack;
    if (!error) {
      error = new Error(message);
    } else if (error && message) {
      const newError = new Error(message);
      newError.originalError = error;
      error = newError;
    } else if (error) {
      tempStack = error.stack;
    }

    error.status = status || error.status || 500;

    if (tempStack) {
      error.stack = tempStack;
    }

    return error;
  }
};
