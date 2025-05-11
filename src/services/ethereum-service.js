const { ethers } = require("ethers");

class EthereumService {
  constructor({
    logger,
    errorHandler,
    ethereumValidator,
    configurationService,
    db,
    transactionService,
  }) {
    if (EthereumService.instance) {
      return EthereumService.instance;
    }

    this._initializeDependencies({
      logger,
      errorHandler,
      ethereumValidator,
      configurationService,
      db,
      transactionService,
    });

    this._initializeProvider();
    this._initializeConfiguration();

    EthereumService.instance = this;
  }

  _initializeDependencies({
    logger,
    errorHandler,
    ethereumValidator,
    configurationService,
    db,
    transactionService,
  }) {
    this.logger = logger;
    this.errorHandler = errorHandler;
    this.ethereumValidator = ethereumValidator;
    this.transactionModel = db.Transaction;
    this.transactionService = transactionService;
    this.configurationService = configurationService;
  }

  _initializeProvider() {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      throw new Error("API_KEY is not set");
    }
    const url = `https://mainnet.infura.io/v3/${API_KEY}`;
    this.provider = new ethers.JsonRpcProvider(url);
  }

  _initializeConfiguration() {
    this.configuration = this.configurationService.get();
    this.configurationService.on(
      "configurationUpdated",
      (newConfiguration) => {
        this.logger.info(
          "[INFO] Configuration updated in EthereumService",
          true
        );
        this.configuration = newConfiguration;
      }
    );
  }

  initialize() {
    this();
  }

  async getTransactionsByHashes(transactionHashes, transactionObjects) {
    return this.transactionService.getTransactionsByHashes(
      transactionHashes,
      transactionObjects
    );
  }
}

module.exports = EthereumService;
