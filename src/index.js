require("dotenv").config();
const express = require("express");
const { scopePerRequest } = require("awilix-express");
const setupContainer = require("./container");
const mountApi = require("./api");

const app = express();
const PORT = process.env.PORT || 3000;

// Setup DI Container
const container = setupContainer();
app.use(scopePerRequest(container));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const logger = req.container.resolve("logger");
  logger.log(
    {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.body,
    },
    "info"
  );
  next();
});

mountApi(app);

// Start Server
app.listen(PORT, () => {
  const logger = container.resolve("logger");
  logger.log(`Server running on port ${PORT}`);
});