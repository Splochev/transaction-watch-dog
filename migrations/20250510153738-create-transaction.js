"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Transactions", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      blockNumber: {
        type: Sequelize.INTEGER,
      },
      blockHash: {
        type: Sequelize.STRING(500),
      },
      chainId: {
        type: Sequelize.STRING(500),
      },
      data: {
        type: Sequelize.STRING(500),
      },
      from: {
        type: Sequelize.STRING(500),
      },
      gasLimit: {
        type: Sequelize.STRING(500),
      },
      gasPrice: {
        type: Sequelize.STRING(500),
      },
      hash: {
        type: Sequelize.STRING(500),
        unique: true,
        allowNull: false,
      },
      maxFeePerGas: {
        type: Sequelize.STRING(500),
      },
      maxPriorityFeePerGas: {
        type: Sequelize.STRING(500),
      },
      maxFeePerBlobGas: {
        type: Sequelize.STRING(500),
      },
      nonce: {
        type: Sequelize.INTEGER,
      },
      to: {
        type: Sequelize.STRING(500),
      },
      type: {
        type: Sequelize.INTEGER,
      },
      value: {
        type: Sequelize.STRING(500),
      },
      contractAddress: {
        type: Sequelize.STRING(500),
      },
      logsBloom: {
        type: Sequelize.STRING(500),
      },
      gasUsed: {
        type: Sequelize.STRING(500),
      },
      cumulativeGasUsed: {
        type: Sequelize.STRING(500),
      },
      status: {
        type: Sequelize.INTEGER,
      },
      accessList: {
        type: Sequelize.JSONB,
      },
      signature: {
        type: Sequelize.JSONB,
      },
      blobVersionedHashes: {
        type: Sequelize.JSONB,
      },
      index: {
        type: Sequelize.INTEGER,
      },
      provider: {
        type: Sequelize.JSONB,
      },
      blobGasUsed: {
        type: Sequelize.STRING(500),
      },
      blobGasPrice: {
        type: Sequelize.STRING(500),
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      ruleId: {
        type: Sequelize.STRING,
        allowNull: false,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Transactions");
  },
};
