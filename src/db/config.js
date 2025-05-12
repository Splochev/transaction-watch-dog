require("dotenv").config();
const Logger = require("../logger/logger");
const logger = new Logger();

module.exports = {
  development: {
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: process.env.LOG_SEQUALIZE === 'true'  ? (msg) => logger.info(msg, false) : false,
  },
  test: {
    // you can override for your test DB here
  },
  production: {
    // and here for production
  }
};
