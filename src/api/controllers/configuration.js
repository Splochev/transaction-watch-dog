module.exports = ({ configurationService }) => ({
  get: async (req, res, next) => {
    try {
      const configuration = configurationService.get();
      res.status(200).json(configuration);
    } catch (error) {
      next(error);
    }
  },
  addRule: async (req, res, next) => {
    try {
      const rule = req.body;
      await configurationService.addRule(rule);
      res.status(201).json({ message: "Rule added successfully" });
    } catch (error) {
      next(error);
    }
  },
  updateRule: async (req, res, next) => {
    try {
      const rule = req.body;
      await configurationService.updateRule(rule);
      res.status(200).json({ message: "Rule updated successfully" });
    } catch (error) {
      next(error);
    }
  },
  updateDelayBlocks: async (req, res, next) => {
    const delayBlocks = req.body.delayBlocks;
    try {
      await configurationService.updateDelayBlocks(delayBlocks);
      res.status(200).json({ message: "Delay blocks updated successfully" });
    } catch (error) {
      next(error);
    }
  },
  deleteRule: async (req, res, next) => {
    try {
      await configurationService.deleteRule(req.params.id);
      res.status(200).json({ message: "Rule deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
});
