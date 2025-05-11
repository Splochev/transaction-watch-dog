const { createContainer, asValue, asClass } = require("awilix");
const db = require("../db");
const Logger = require("../logger/logger");
const ErrorHandler = require("../utils/error-handler");
const EthereumService = require("../services/ethereum-service");
const ConfigurationService = require("../services/configuration-service");
const {
  ruleSchema,
  configurationSchema,
} = require("../schemas/configuration");
const ConfigurationValidator = require("../validators/configuration");

module.exports = function setupContainer() {
  const container = createContainer();

  container.register({
    db: asValue(db),
    ruleSchema: asValue(ruleSchema),
    configurationSchema: asValue(configurationSchema),
    logger: asClass(Logger).singleton(),
    errorHandler: asClass(ErrorHandler).singleton(),
    ethereumService: asClass(EthereumService).singleton(),
    configurationService: asClass(ConfigurationService).singleton(),
    configurationValidator: asClass(ConfigurationValidator).singleton(),
  });

  return container;
};
