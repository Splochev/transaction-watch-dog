const { createContainer, asValue, asClass } = require("awilix");
const db = require("../db");
const Logger = require("../logger/logger");
const ErrorHandler = require("../utils/error-handler");
const EthereumService = require("../services/ethereum-service");
const ConfigurationService = require("../services/configuration-service");
const EthereumValidator = require("../validators/ethereum");
const {
  transactionHashesSchema,
  transactionsSchema,
} = require("../schemas/ethereum");

module.exports = function setupContainer() {
  const container = createContainer();

  container.register({
    db: asValue(db),
    logger: asClass(Logger).singleton(),
    errorHandler: asClass(ErrorHandler).singleton(),
    ethereumService: asClass(EthereumService).singleton(),
    configurationService: asClass(ConfigurationService).singleton(),
    ethereumValidator: asClass(EthereumValidator).singleton(),
    transactionHashesSchema: asValue(transactionHashesSchema),
    transactionsSchema: asValue(transactionsSchema),
  });

  return container;
};
