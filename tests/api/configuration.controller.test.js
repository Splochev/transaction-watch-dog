const createController = require("../../src/api/controllers/configuration");

describe("Configuration Controller", () => {
  let controller;
  let configurationService;
  let req;
  let res;
  let next;

  beforeEach(() => {
    // Mocked service with all methods as jest.fn()
    configurationService = {
      get: jest.fn(),
      addRule: jest.fn(),
      updateRule: jest.fn(),
      updateDelayBlocks: jest.fn(),
      deleteRule: jest.fn(),
    };
    controller = createController({ configurationService });

    // Minimal Express req/res/next mocks
    req = { body: {}, params: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("get", () => {
    it("should return configuration with status 200", async () => {
      const fakeConfig = { delayBlocks: 1, rules: [] };
      configurationService.get.mockReturnValue(fakeConfig);

      await controller.get(req, res, next);

      expect(configurationService.get).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeConfig);
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next(error) when service throws", async () => {
      const err = new Error("fail");
      configurationService.get.mockImplementation(() => {
        throw err;
      });

      await controller.get(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe("addRule", () => {
    it("should add rule and return 201", async () => {
      const newRule = { id: "r1" };
      req.body = newRule;

      await controller.addRule(req, res, next);

      expect(configurationService.addRule).toHaveBeenCalledWith(newRule);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rule added successfully",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next(error) when service.addRule throws", async () => {
      const err = new Error("bad");
      configurationService.addRule.mockRejectedValue(err);

      await controller.addRule(req, res, next);

      expect(configurationService.addRule).toHaveBeenCalled();
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe("updateRule", () => {
    it("should update rule and return 200", async () => {
      const updatedRule = { id: "r2" };
      req.body = updatedRule;

      await controller.updateRule(req, res, next);

      expect(configurationService.updateRule).toHaveBeenCalledWith(updatedRule);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rule updated successfully",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next(error) when service.updateRule throws", async () => {
      const err = new Error("oops");
      configurationService.updateRule.mockRejectedValue(err);

      await controller.updateRule(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe("updateDelayBlocks", () => {
    it("should update delayBlocks and return 200", async () => {
      req.body = { delayBlocks: 10 };

      await controller.updateDelayBlocks(req, res, next);

      expect(configurationService.updateDelayBlocks).toHaveBeenCalledWith(10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Delay blocks updated successfully",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next(error) when service.updateDelayBlocks throws", async () => {
      const err = new Error("bad delay");
      configurationService.updateDelayBlocks.mockRejectedValue(err);

      req.body = { delayBlocks: -5 };
      await controller.updateDelayBlocks(req, res, next);

      expect(configurationService.updateDelayBlocks).toHaveBeenCalledWith(-5);
      expect(next).toHaveBeenCalledWith(err);
    });
  });

  describe("deleteRule", () => {
    it("should delete rule and return 200", async () => {
      req.params = { id: "r3" };

      await controller.deleteRule(req, res, next);

      expect(configurationService.deleteRule).toHaveBeenCalledWith("r3");
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Rule deleted successfully",
      });
      expect(next).not.toHaveBeenCalled();
    });

    it("should call next(error) when service.deleteRule throws", async () => {
      const err = new Error("not found");
      configurationService.deleteRule.mockRejectedValue(err);

      req.params = { id: "r4" };
      await controller.deleteRule(req, res, next);

      expect(configurationService.deleteRule).toHaveBeenCalledWith("r4");
      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
