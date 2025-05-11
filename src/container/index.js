const { createContainer, asValue, asClass } = require("awilix");
const db = require("../db");
const Logger = require("../logger/logger");
const ErrorHandler = require("../utils/error-handler");
const EthereumService = require("../services/ethereum-service");
const ConfigurationService = require("../services/configuration-service");
const TransactionService = require("../services/transaction-service");
const EthereumValidator = require("../validators/ethereum");
const {
  transactionHashesSchema,
  transactionsSchema,
} = require("../schemas/ethereum");
const {
  configurationSchema,
  configurationsSchema,
} = require("../schemas/configuration");
const ConfigurationValidator = require("../validators/configuration");

module.exports = function setupContainer() {
  const container = createContainer();

  container.register({
    db: asValue(db),
    transactionHashesSchema: asValue(transactionHashesSchema),
    transactionsSchema: asValue(transactionsSchema),
    configurationSchema: asValue(configurationSchema),
    configurationsSchema: asValue(configurationsSchema),
    logger: asClass(Logger).singleton(),
    errorHandler: asClass(ErrorHandler).singleton(),
    ethereumService: asClass(EthereumService).singleton(),
    configurationService: asClass(ConfigurationService).singleton(),
    transactionService: asClass(TransactionService).singleton(),
    ethereumValidator: asClass(EthereumValidator).singleton(),
    configurationValidator: asClass(ConfigurationValidator).singleton(),
  });

  return container;
};
