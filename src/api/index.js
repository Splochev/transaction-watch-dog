const { Router } = require("express");
const ethereumRouter = require("./routers/ethereum");
const configurationRouter = require("./routers/configuration");

module.exports = (app) => {
  const router = Router();
  router.use("/ethereum", ethereumRouter);
  router.use("/config", configurationRouter);
  app.use("/api", router);
};
