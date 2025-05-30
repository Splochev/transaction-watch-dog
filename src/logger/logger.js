const winston = require("winston");
const path = require("path");
const fs = require("fs");

const CONSOLE_LOG = process.env.CONSOLE_LOG === "true";

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

    return winston.createLogger({
      transports: transportsArray,
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.errors({ stack: true }),
        winston.format.json()
      ),
    });
  }

  error(message, logToConsole = CONSOLE_LOG) {
    if (message.stack) {
      this.logger.error({
        message: message.message,
        stack: message.stack,
      });
    } else {
      this.logger.error(message);
    }

    if (logToConsole) {
      console.error(message);
    }
  }

  warn(message, logToConsole = CONSOLE_LOG) {
    this.logger.warn(message);
    if (logToConsole) {
      console.console.warn(message);
    }
  }

  info(message, logToConsole = CONSOLE_LOG) {
    this.logger.info(message);
    if (logToConsole) {
      console.log(message);
    }
  }

  log(message) {
    console.log(message);
  }
}

module.exports = Logger;
