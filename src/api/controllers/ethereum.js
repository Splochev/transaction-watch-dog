module.exports = ({ logger, errorHandler, ethereumService, db }) => ({
  health: async (req, res, next) => {
    try {
      res.json({ status: "ok" });
    } catch (error) {
      next(error);
    }
  },
});
