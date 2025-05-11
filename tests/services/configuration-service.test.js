const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const _ = require("lodash");

// clear singleton before require
delete require.cache[
  require.resolve("../../src/services/configuration-service")
];
const ConfigurationService = require("../../src/services/configuration-service");

describe("ConfigurationService", () => {
  let logger;
  let errorHandler;
  let configurationValidator;
  let defaultConfig;

  beforeEach(() => {
    // Reset singleton
    delete ConfigurationService.instance;

    // Mocks
    logger = { info: jest.fn(), error: jest.fn() };
    errorHandler = {
      generateError: jest.fn(({ message, status }) => {
        const e = new Error(message);
        e.status = status;
        return e;
      }),
    };
    configurationValidator = {
      assertValidConfiguration: jest.fn(),
      assertValidRule: jest.fn(),
    };

    // default JSON content
    defaultConfig = { delayBlocks: 0, rules: [] };

    // fs mocks
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    jest
      .spyOn(fs, "readFileSync")
      .mockReturnValue(JSON.stringify(defaultConfig));
    jest.spyOn(fs, "writeFileSync").mockImplementation(() => {});
    jest.spyOn(fs, "watchFile").mockImplementation(() => {});
    jest.spyOn(fs, "unwatchFile").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("initializes from disk when file exists", () => {
    const svc = new ConfigurationService({
      logger,
      errorHandler,
      configurationValidator,
    });
    expect(fs.existsSync).toHaveBeenCalledWith(svc.configurationPath);
    expect(fs.readFileSync).toHaveBeenCalledWith(svc.configurationPath, "utf8");
    expect(
      configurationValidator.assertValidConfiguration
    ).toHaveBeenCalledWith(defaultConfig);
    expect(svc.configuration).toEqual(defaultConfig);
    expect(fs.watchFile).toHaveBeenCalled();
  });

  it("creates default file when none exists", () => {
    fs.existsSync.mockReturnValue(false);
    const svc = new ConfigurationService({
      logger,
      errorHandler,
      configurationValidator,
    });
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      svc.configurationPath,
      JSON.stringify(defaultConfig, null, 2),
      "utf8"
    );
    expect(fs.readFileSync).toHaveBeenCalled();
    expect(configurationValidator.assertValidConfiguration).toHaveBeenCalled();
    expect(svc.configuration).toEqual(defaultConfig);
  });

  it("get() returns a deep clone", () => {
    const svc = new ConfigurationService({
      logger,
      errorHandler,
      configurationValidator,
    });
    svc.configuration.rules.push({ id: "r1" });
    const got = svc.get();
    expect(got).toEqual(svc.configuration);
    got.rules.push({ id: "r2" });
    expect(svc.configuration.rules).toHaveLength(1);
  });

  describe("addRule()", () => {
    const newRule = { id: "r1", name: "n1", enabled: true, match: {} };

    it("adds a rule and writes file", async () => {
      const svc = new ConfigurationService({
        logger,
        errorHandler,
        configurationValidator,
      });
      await svc.addRule(newRule);
      expect(configurationValidator.assertValidRule).toHaveBeenCalledWith(
        newRule
      );
      expect(svc.configuration.rules).toContainEqual(newRule);
      expect(fs.writeFileSync).toHaveBeenCalledWith(
        svc.configurationPath,
        JSON.stringify(svc.configuration, null, 2),
        "utf8"
      );
    });

    it("throws if rule already exists", async () => {
      const svc = new ConfigurationService({
        logger,
        errorHandler,
        configurationValidator,
      });
      svc.configuration.rules.push(newRule);
      await expect(svc.addRule(newRule)).rejects.toThrow("Rule already exists");
      expect(errorHandler.generateError).toHaveBeenCalledWith({
        message: "Rule already exists",
        status: 400,
      });
    });
  });

  describe("updateDelayBlocks()", () => {
    it("updates when valid", async () => {
      const svc = new ConfigurationService({
        logger,
        errorHandler,
        configurationValidator,
      });
      await svc.updateDelayBlocks(5);
      expect(svc.configuration.delayBlocks).toBe(5);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("throws on negative or non-numeric", async () => {
      const svc = new ConfigurationService({
        logger,
        errorHandler,
        configurationValidator,
      });
      await expect(svc.updateDelayBlocks(-1)).rejects.toThrow(
        "Delay blocks must be a positive number"
      );
      expect(errorHandler.generateError).toHaveBeenCalledWith({
        message: "Delay blocks must be a positive number",
        status: 400,
      });
    });
  });

  describe("updateRule()", () => {
    const existing = { id: "r1", name: "n1", enabled: true, match: {} };
    const updated = { ...existing, enabled: false };

    it("updates an existing rule", async () => {
      const svc = new ConfigurationService({
        logger,
        errorHandler,
        configurationValidator,
      });
      svc.configuration.rules.push(existing);
      await svc.updateRule(updated);
      expect(configurationValidator.assertValidRule).toHaveBeenCalledWith(
        updated
      );
      expect(svc.configuration.rules[0]).toEqual(updated);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("throws if rule not found", async () => {
      const svc = new ConfigurationService({
        logger,
        errorHandler,
        configurationValidator,
      });
      await expect(svc.updateRule(updated)).rejects.toThrow(
        "Rule with that ID was not found"
      );
      expect(errorHandler.generateError).toHaveBeenCalledWith({
        message: "Rule with that ID was not found",
        status: 404,
      });
    });
  });

  describe("deleteRule()", () => {
    const existing = { id: "r1", name: "n1", enabled: true, match: {} };

    it("deletes an existing rule", async () => {
      const svc = new ConfigurationService({
        logger,
        errorHandler,
        configurationValidator,
      });
      svc.configuration.rules.push(existing);
      await svc.deleteRule("r1");
      expect(svc.configuration.rules).toHaveLength(0);
      expect(fs.writeFileSync).toHaveBeenCalled();
    });

    it("throws if rule not found", async () => {
      const svc = new ConfigurationService({
        logger,
        errorHandler,
        configurationValidator,
      });
      await expect(svc.deleteRule("rX")).rejects.toThrow(
        "Rule with that ID was not found"
      );
      expect(errorHandler.generateError).toHaveBeenCalledWith({
        message: "Rule with that ID was not found",
        status: 404,
      });
    });
  });

  it("cleanup() should unwatch file", () => {
    const svc = new ConfigurationService({
      logger,
      errorHandler,
      configurationValidator,
    });
    svc.cleanup();
    expect(fs.unwatchFile).toHaveBeenCalledWith(svc.configurationPath);
  });
});
