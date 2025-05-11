module.exports = ({}) => ({
  health: async (req, res, next) => {
    try {
      res.json({ status: "ok" });
    } catch (error) {
      next(error);
    }
  },
});
