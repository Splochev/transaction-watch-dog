const _ = require("lodash");
const { ethers } = require("ethers");

class TransactionService {
  constructor({ ethereumValidator }) {
    if (TransactionService.instance) {
      return TransactionService.instance;
    }

    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
      throw new Error("API_KEY is not set");
    }

    this.ethereumValidator = ethereumValidator;
    this.provider = new ethers.JsonRpcProvider(
      `https://mainnet.infura.io/v3/${API_KEY}`
    );

    TransactionService.instance = this;
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

    const transactions =
      transactionObjects || (await Promise.all(transactionPromises));
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

module.exports = TransactionService;
