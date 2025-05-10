const { createContainer, asValue, asClass } = require("awilix");
const db = require("../db");
const Logger = require("../logger/logger");
const ErrorHandler = require("../utils/error-handler");

module.exports = function setupContainer() {
  const container = createContainer();

  container.register({
    logger: asClass(Logger).singleton(),
    db: asValue(db),
    errorHandler: asClass(ErrorHandler).singleton(),
  });

  return container;
};
