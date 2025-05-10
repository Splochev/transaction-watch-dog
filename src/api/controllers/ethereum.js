module.exports = ({ logger, errorHandler }) => ({
  health: async (req, res, next) => {
    try {
      test;
      res.json({ status: "ok" });
    } catch (error) {
      next(
        errorHandler.generateError(
          error,
          "Internal Server Error - TEST TEST TEST",
          200
        )
      );
    }
  },
});
