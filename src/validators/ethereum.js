class EthereumValidator {
  constructor({ errorHandler, transactionHashesSchema, transactionsSchema }) {
    if (EthereumValidator.instance) {
      return EthereumValidator.instance;
    }

    this.transactionsSchema = transactionsSchema;
    this.transactionHashesSchema = transactionHashesSchema;
    this.errorHandler = errorHandler;

    EthereumValidator.instance = this;
  }

  assertValidTransactionHashes(transactionHashes) {
    try {
      this.transactionHashesSchema.parse(transactionHashes);
    } catch (error) {
      throw this.errorHandler.generateError({
        error,
        message: error.message || "Invalid transaction hashes",
        status: 400,
      });
    }
  }

  assertValidTransactionObjects(existingTransactions, checkForNull = true) {
    if (!existingTransactions && !checkForNull) return;
    try {
      this.transactionsSchema.parse(existingTransactions);
    } catch (error) {
      throw this.errorHandler.generateError({
        error,
        message: error.message || "Invalid transaction objects",
        status: 400,
      });
    }
  }
}
module.exports = EthereumValidator;
