module.exports = ({ configurationService }) => ({
  get: async (req, res, next) => {
    try {
      const configurations = configurationService.get();
      res.status(200).json(configurations);
    } catch (error) {
      next(error);
    }
  },
  getById: async (req, res, next) => {
    try {
      const configurationId = req.params.id;
      const configuration = await configurationService.getById(configurationId);
      res.status(200).json(configuration);
    } catch (error) {
      next(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const configuration = req.body;
      await configurationService.create(configuration);
      res.status(201).json({ message: "Configuration created successfully" });
    } catch (error) {
      next(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const configuration = req.body;
      await configurationService.update(configuration);
      res.status(200).json({ message: "Configuration updated successfully" });
    } catch (error) {
      next(error);
    }
  },
  delete: async (req, res, next) => {
    try {
      const configurationId = req.params.id;
      await configurationService.delete(configurationId);
      res.status(200).json({ message: "Configuration deleted successfully" });
    } catch (error) {
      next(error);
    }
  },
});
