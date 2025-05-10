const { Router } = require('express');
const ethereumRouter = require('./routers/ethereum');

module.exports = (app) => {
  const router = Router();
  router.use('/ethereum', ethereumRouter);
  app.use('/api', router);
};
