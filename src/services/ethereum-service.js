const { ethers } = require("ethers");

class EthereumService {
  constructor(dependencies) {
    if (EthereumService.instance) {
      return EthereumService.instance;
    }

    this._initializeDependencies(dependencies);
    this._initializeProvider();
    this._initializeConfiguration();

    this.monitorBlockchain();
    EthereumService.instance = this;
  }

  _initializeDependencies(dependencies) {
    try {
      this.logger = dependencies.logger;
      this.errorHandler = dependencies.errorHandler;
      this.transactionModel = dependencies.db.Transaction;
      this.configurationService = dependencies.configurationService;
    } catch (error) {
      throw new Error(
        "[ERROR] Failed to initialize dependencies: " + error.message
      );
    }
  }

  _initializeProvider() {
    try {
      const API_KEY = process.env.API_KEY;
      if (!API_KEY) {
        throw new Error("API_KEY is not set");
      }
      const url = `https://mainnet.infura.io/v3/${API_KEY}`;
      this.provider = new ethers.JsonRpcProvider(url);
    } catch (error) {
      throw new Error(
        "[ERROR] Failed to initialize provider: " + error.message
      );
    }
  }

  async monitorBlockchain() {
    try {
      this.fromBlock = null;
      this.toBlock = null;
      const delayBlocks = this.delayBlocks || 0;

      this.provider.on("block", async (blockNumber) => {
        try {
          if (this.fromBlock === null) {
            this.fromBlock = blockNumber;
            this.toBlock = blockNumber + delayBlocks;
          }

          if (blockNumber >= this.toBlock) {
            await this.monitorTransactions(this.fromBlock, this.toBlock);
            this.fromBlock = blockNumber;
            this.toBlock = blockNumber + delayBlocks;
          }
        } catch (error) {
          this.logger.error({
            message: "[ERROR] Error in block monitoring",
            error,
          });
        }
      });

      this.logger.info("[INFO] Ethereum blockchain monitoring started...");
    } catch (error) {
      this.logger.error({
        message: "[ERROR] Failed to start blockchain monitoring",
        error,
      });
    }
  }

  async monitorTransactions(fromBlock, toBlock) {
    try {
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
        await new Promise((r) => setTimeout(r, 2000)); // Simulate delay
        const processedTransactions = logs.map((log) =>
          this._processLog(log, rule.id)
        );
        await this.insertTransaction(processedTransactions);
      }
    } catch (error) {
      this.logger.error({
        message: "[ERROR] Failed to monitor transactions",
        error,
      });
    }
  }

  _processLog(log, ruleId) {
    return {
      blockNumber: log.blockNumber,
      blockHash: log.blockHash,
      transactionHash: log.transactionHash,
      address: log.address,
      data: log.data,
      topics: log.topics,
      ruleId: ruleId,
    };
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
    try {
      if (this.configurationUpdatedListener) {
        this.configurationService.off(
          "configurationUpdated",
          this.configurationUpdatedListener
        );
      }
    } catch (error) {
      this.logger.error({ message: "[ERROR] Failed to clean up", error });
    }
  }
}

module.exports = EthereumService;
