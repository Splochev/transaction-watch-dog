"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Transaction extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The models/index file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transaction.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      blockNumber: DataTypes.INTEGER,
      blockHash: DataTypes.STRING,
      chainId: DataTypes.STRING,
      data: DataTypes.STRING,
      from: DataTypes.STRING,
      gasLimit: DataTypes.STRING,
      gasPrice: DataTypes.STRING,
      hash: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      maxFeePerGas: DataTypes.STRING,
      maxPriorityFeePerGas: DataTypes.STRING,
      maxFeePerBlobGas: DataTypes.STRING,
      nonce: DataTypes.INTEGER,
      to: DataTypes.STRING,
      type: DataTypes.INTEGER,
      value: DataTypes.STRING,
      contractAddress: DataTypes.STRING,
      logsBloom: DataTypes.STRING,
      gasUsed: DataTypes.STRING,
      cumulativeGasUsed: DataTypes.STRING,
      status: DataTypes.INTEGER,
      accessList: DataTypes.JSONB,
      signature: DataTypes.JSONB,
      blobVersionedHashes: DataTypes.JSONB,
      index: DataTypes.INTEGER,
      provider: DataTypes.JSONB,
      blobGasUsed: DataTypes.STRING,
      blobGasPrice: DataTypes.STRING,
      ruleId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Transaction",
    }
  );
  return Transaction;
};
