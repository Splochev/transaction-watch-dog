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
      transactionHash: {
        type: Sequelize.STRING(500),
        unique: true,
        allowNull: false,
      },
      blockHash: {
        type: Sequelize.STRING(500),
      },
      blockNumber: {
        type: Sequelize.INTEGER,
      },
      address: {
        type: Sequelize.STRING(500),
      },
      data: {
        type: Sequelize.STRING(500),
      },
      topics:{
        type: Sequelize.JSONB,
      },
      ruleId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
            createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("Transactions");
  },
};