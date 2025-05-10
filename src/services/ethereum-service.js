const { ethers } = require("ethers");
const _ = require("lodash");

class EthereumService {
  constructor({ logger, errorHandler, ethereumValidator }) {
    if (EthereumService.instance) {
      return EthereumService.instance;
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      throw new Error("API_KEY is not set");
    }
    const url = `https://mainnet.infura.io/v3/${API_KEY}`;

    this.provider = new ethers.JsonRpcProvider(url);
    this.logger = logger;
    this.errorHandler = errorHandler;
    this.ethereumValidator = ethereumValidator;

    EthereumService.instance = this;
  }

  async getTransactionsByHashes(transactionHashes, transactionObjects) {
    try {
      this.ethereumValidator.assertValidTransactionHashes(transactionHashes);
      this.ethereumValidator.assertValidTransactionObjects(
        transactionObjects,
        false
      );

      const { transactions, receipts } =
        await this.fetchTransactionsAndReceipts(
          transactionHashes,
          transactionObjects
        );

      return this.mergeTransactionsAndReceipts(transactions, receipts);
    } catch (error) {
      throw error;
    }
  }

  async fetchTransactionsAndReceipts(transactionHashes, transactionObjects) {
    const transactionPromises = [];
    const receiptPromises = [];

    transactionHashes.forEach((hash) => {
      if (!transactionObjects) {
        transactionPromises.push(this.provider.getTransaction(hash));
      }
      receiptPromises.push(this.provider.getTransactionReceipt(hash));
    });

    const transactions = transactionObjects || (await Promise.all(transactionPromises));
    const receipts = await Promise.all(receiptPromises);
    return { transactions, receipts };
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
