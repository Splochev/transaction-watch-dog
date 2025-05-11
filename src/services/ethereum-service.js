const { ethers } = require("ethers");

class EthereumService {
  constructor(dependencies) {
    if (EthereumService.instance) {
      return EthereumService.instance;
    }

    this._initializeDependencies(dependencies);
    this._initializeProvider();
    this._initializeConfiguration();

    EthereumService.instance = this;
  }

  _initializeDependencies(dependencies) {
    this.logger = dependencies.logger;
    this.errorHandler = dependencies.errorHandler;
    this.ethereumValidator = dependencies.ethereumValidator;
    this.transactionModel = dependencies.db.Transaction;
    this.transactionService = dependencies.transactionService;
    this.configurationService = dependencies.configurationService;
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
    const configuration = this.configurationService.get();
    this.rules = configuration.rules;
    this.delayBlocks = configuration.delayBlocks;

    this.configurationService.on("configurationUpdated", (newConfiguration) => {
      this.logger.info("[INFO] Configuration updated in EthereumService", true);
      this.rules = newConfiguration.rules;
      this.delayBlocks = newConfiguration.delayBlocks;
    });
  }

  initialize() {
    this();
  }

  cleanup() {
    if (this.configurationUpdatedListener) {
      this.configurationService.off(
        "configurationUpdated",
        this.configurationUpdatedListener
      );
    }
  }

  async getTransactionsByHashes(transactionHashes, transactionObjects) {
    return this.transactionService.getTransactionsByHashes(
      transactionHashes,
      transactionObjects
    );
  }
}

module.exports = EthereumService;
