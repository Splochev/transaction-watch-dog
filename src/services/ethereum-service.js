const { ethers } = require("ethers");
const _ = require("lodash");

class EthereumService {
  constructor({ logger, errorHandler }) {
    if (EthereumService.instance) {
      return EthereumService.instance;
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      throw new Error("API_KEY is not set");
    }

    this.provider = new ethers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/${API_KEY}`
    );
    this.logger = logger;
    this.errorHandler = errorHandler;

    EthereumService.instance = this;
  }

  async getTransactionsByHashes(transactionHashes, existingTransactions) {
    if (
      !Array.isArray(transactionHashes) ||
      !this.isValidTransactionHashArr(transactionHashes)
    ) {
      throw this.errorHandler.generateError({
        error: new Error("Invalid transaction hashes"),
        status: 400,
      });
    }

    if (
      existingTransactions &&
      !this.isValidExistingTransactions(existingTransactions)
    ) {
      throw this.errorHandler.generateError({
        error: new Error("Invalid existing transactions"),
        status: 400,
      });
    }

    try {
      const transactions =
        existingTransactions ||
        (await this.fetchTransactions(transactionHashes));
      const receipts = await this.fetchReceipts(transactionHashes);

      return this.mergeTransactionsAndReceipts(transactions, receipts);
    } catch (error) {
      throw error;
    }
  }

  isValidTransactionHashArr(transactionHashes) {
    return transactionHashes.every(
      (hash) => typeof hash === "string" && hash.startsWith("0x")
    );
  }

  isValidExistingTransactions(transactions) {
    return (
      Array.isArray(transactions) &&
      transactions.every((tx) => typeof tx === "object")
    );
  }

  async fetchTransactions(transactionHashes) {
    return Promise.all(
      transactionHashes.map((hash) => this.provider.getTransaction(hash))
    );
  }

  async fetchReceipts(transactionHashes) {
    return Promise.all(
      transactionHashes.map((hash) => this.provider.getTransactionReceipt(hash))
    );
  }

  mergeTransactionsAndReceipts(transactions, receipts) {
    return transactions
      .filter((transaction, i) => transaction && receipts[i])
      .map((transaction, i) => {
        const receipt = this.parseBigIntOfObject(receipts[i]);
        transaction = this.parseBigIntOfObject(transaction);
        return _.merge(transaction, receipt);
      });
  }

  parseBigIntOfObject(obj) {
    const newObj = {};
    for (const key in obj) {
      if (typeof obj[key] === "bigint") {
        newObj[key] = obj[key].toString();
      } else {
        newObj[key] = obj[key];
      }
    }
    return newObj;
  }
}

module.exports = EthereumService;
