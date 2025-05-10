module.exports = ({ logger }) => ({
  health: async (req, res, next) => {
    try {
      res.json({ status: 'ok' });
    } catch (err) {
      logger.error(err)
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
});
