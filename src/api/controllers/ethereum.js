module.exports = ({ ethereumService }) => ({
  get: async (req, res, next) => {
    try {
      const { transactionHash, blockNumber, page, ruleId, orderBy, sortType } =
        req.query;
      const transactions = await ethereumService.get({
        transactionHash,
        blockNumber,
        page,
        ruleId,
        orderBy,
        sortType,
      });
      res.status(200).json(transactions);
    } catch (error) {
      next(error);
    }
  },
});
