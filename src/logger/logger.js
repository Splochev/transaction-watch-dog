const winston = require("winston");
const path = require("path");
const fs = require("fs");

class Logger {
  constructor() {
    if (Logger.instance) {
      return Logger.instance;
    }

    const parentDir = path.resolve(__dirname, "../../");
    const serverLogsDir = path.join(parentDir, "logs");

    this.ensureDirExists(serverLogsDir);

    const maxDaysToStoreLogs = Number(process.env.MAX_DAYS_TO_STORE_LOGS);
    if (isNaN(maxDaysToStoreLogs)) {
      throw new Error(
        "MAX_DAYS_TO_STORE_LOGS environment variable is not set or not a number."
      );
    }
    this.maxDaysToStoreLogs = maxDaysToStoreLogs;
    this.serverLogsDir = serverLogsDir;

    this.cleanupOldLogs(serverLogsDir, maxDaysToStoreLogs);

    this.logger = this.createLogger(this.serverLogsDir);
    Logger.instance = this;
  }

  ensureDirExists(dir) {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }

  cleanupOldLogs(dir, maxDaysToStoreLogs) {
    const files = fs.readdirSync(dir);
    const now = Date.now();

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stats = fs.statSync(filePath);
      const fileAgeInDays =
        (now - new Date(stats.mtime)) / (1000 * 60 * 60 * 24);

      if (fileAgeInDays > maxDaysToStoreLogs) {
        fs.unlinkSync(filePath);
      }
    });
  }

  createLogger(dir) {
    const timestamp = new Date().toISOString().split("T")[0];
    const logFilePath = path.join(dir, `logs-${timestamp}.log`);

    const transportsArray = [
      new winston.transports.File({
        filename: logFilePath,
        options: { flags: "a" },
      }), // 'a' flag for appending to the file
    ];

    if (process.env.CONSOLE_LOG === "true") {
      transportsArray.push(new winston.transports.Console());
    }

    return winston.createLogger({
      transports: transportsArray,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
    });
  }

  error(message) {
    if (message.stack) {
      this.logger.error({
        message: message.message,
        stack: message.stack,
      });
    } else {
      this.logger.error(message);
    }
  }

  warn(message) {
    this.logger.warn(message);
  }

  info(message) {
    this.logger.info(message);
  }

  log(message) {
    console.log(message);
  }
}

module.exports = Logger;
