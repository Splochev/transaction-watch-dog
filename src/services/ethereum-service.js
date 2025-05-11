const { ethers } = require("ethers");

class EthereumService {
  constructor(dependencies) {
    if (EthereumService.instance) {
      return EthereumService.instance;
    }

    this._initializeDependencies(dependencies);
    this._initializeProvider();
    this._initializeConfiguration();

    // this.monitorBlockchain();
    EthereumService.instance = this;
  }

  _initializeDependencies(dependencies) {
    this.logger = dependencies.logger;
    this.errorHandler = dependencies.errorHandler;
    this.transactionModel = dependencies.db.Transaction;
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

  async monitorBlockchain() {
    this.fromBlock = null;
    this.toBlock = null;
    const delayBlocks = this.delayBlocks || 0;

    this.provider.on("block", async (blockNumber) => {
      if (this.fromBlock === null) {
        this.fromBlock = blockNumber;
        this.toBlock = blockNumber + delayBlocks;
      }

      if (blockNumber >= this.toBlock) {
        this.monitorTransactions(this.fromBlock, this.toBlock);
        this.fromBlock = blockNumber;
        this.toBlock = blockNumber + delayBlocks;
      }
    });

    this.logger.info("[INFO] Ethereum blockchain monitoring started...");
  }

  async monitorTransactions(fromBlock, toBlock) {
    const rules = this.rules;

    for (const rule of rules) {
      if (!rule.enabled) continue;

      const filter = {
        address: rule.match.address,
        topics: rule.match.topics || undefined,
        fromBlock: fromBlock,
        toBlock: toBlock,
      };

      const logs = await this.provider.getLogs(filter);
      await new Promise((r) => setTimeout(r, 2000));
      const processedTransactions = logs.map((log) => {
        return {
          blockNumber: log.blockNumber,
          blockHash: log.blockHash,
          transactionHash: log.transactionHash,
          address: log.address,
          data: log.data,
          topics: log.topics,
          ruleId: rule.id,
        };
      });
      await this.insertTransaction(processedTransactions);
    }
  }

  async insertTransaction(transactions) {
    if (!transactions || transactions.length === 0) return;

    try {
      const uniqueTransactions = Array.from(
        new Map(transactions.map((tx) => [tx.transactionHash, tx])).values()
      );

      await this.transactionModel.bulkCreate(uniqueTransactions, {
        updateOnDuplicate: [
          "blockNumber",
          "blockHash",
          "address",
          "data",
          "topics",
          "ruleId",
          "updatedAt",
        ],
      });
    } catch (error) {
      this.logger.error({
        message: "[ERROR] Failed to insert transactions:",
        error,
      });
    }
  }

  _initializeConfiguration() {
    const configuration = this.configurationService.get();
    this.rules = configuration.rules;
    this.delayBlocks = configuration.delayBlocks;

    this.configurationService.on("configurationUpdated", (newConfiguration) => {
      this.logger.info("[INFO] Configuration updated in EthereumService");
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
}

module.exports = EthereumService;
