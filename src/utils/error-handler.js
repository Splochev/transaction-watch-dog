module.exports = class ErrorHandler {
  generateError({ error, message, status }) {
    error.status = status || error.status;
    
    if (message) {
      error.message = message;
      error.originalErrorMessage = error.message;
    }

    error.stack = error.stack;
    return error;
  }
};
