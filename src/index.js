require("dotenv").config();
const express = require("express");
const { scopePerRequest } = require("awilix-express");
const setupContainer = require("./container");
const mountApi = require("./api");

const SERVER_TIMEOUT = Number(process.env.SERVER_TIMEOUT || 600000);
const app = express();
const PORT = process.env.PORT || 3000;

const container = setupContainer();
app.use(scopePerRequest(container));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

container.resolve("configurationService");

app.use((req, res, next) => {
  res.setTimeout(SERVER_TIMEOUT, () => {
    console.error("Request has timed out");
    res.status(408).send("Request Timeout");
  });
  next();
});

app.use((req, res, next) => {
  const logger = req.container.resolve("logger");
  logger.info({
    method: req.method,
    path: req.path,
    query: req.query,
    body: req.body,
  });
  next();
});

mountApi(app);

app.use((error, req, res, next) => {
  const logger = req.container.resolve("logger");
  logger.error(error, true);
  res.status(error.status || 500).json({
    error: {
      message: error.message || "Internal Server Error",
    },
  });
});

app.listen(PORT, () => {
  const logger = container.resolve("logger");
  logger.info(`Server running on port ${PORT}`, true);
});
