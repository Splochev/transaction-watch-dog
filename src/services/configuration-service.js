const EventEmitter = require("events");
const _ = require("lodash");
const path = require("path");
const fs = require("fs");

class ConfigurationService extends EventEmitter {
  constructor({ logger, errorHandler, configurationValidator }) {
    super();
    if (ConfigurationService.instance) {
      return ConfigurationService.instance;
    }

    this.logger = logger;
    this.errorHandler = errorHandler;
    this.configurationValidator = configurationValidator;

    this.configurationPath = this._getConfigurationsPath();
    this.configuration = [];

    this._initialize();
    this._watchConfigurationsFile();

    ConfigurationService.instance = this;
  }

  initialize() {
    this();
  }

  getInstance() {
    if (!ConfigurationService.instance) {
      throw new Error("ConfigurationService is not initialized");
    }
    return ConfigurationService.instance;
  }

  _getConfigurationsPath() {
    const dir = path.resolve(__dirname, "../../");
    const fileName = "configuration.json";
    return path.join(dir, fileName);
  }

  _initialize() {
    this._ensureConfigurationFileExists();
    this._loadConfiguration();
  }

  _ensureConfigurationFileExists() {
    if (!fs.existsSync(this.configurationPath)) {
      this._writeConfiguration({
        delayBlocks: 0,
        rules: [],
      });
    }
  }

  _loadConfiguration() {
    const fileContents = fs.readFileSync(this.configurationPath, "utf8");
    const configuration = JSON.parse(fileContents);
    this.configurationValidator.assertValidConfiguration(configuration);
    this.configuration = configuration;

    // Emit an event whenever configuration are loaded or updated
    this.emit("configurationUpdated", this.configuration);
  }

  _writeConfiguration(configuration) {
    fs.writeFileSync(
      this.configurationPath,
      JSON.stringify(configuration, null, 2),
      "utf8"
    );
  }

  _ruleExists(rule) {
    const { id, name, ...rest } = rule;

    return this.configuration.rules.some((rule) => {
      const { id: ruleId, name: ruleName, ...configRest } = rule;
      const check = _.isEqual(rest, configRest);
      if (!check) {
        return id === ruleId || name === ruleName;
      }
      return check;
    });
  }

  _findRuleIndexById(ruleId) {
    return this.configuration.rules.findIndex((rule) => rule.id === ruleId);
  }

  _watchConfigurationsFile() {
    const reloadConfiguration = _.debounce(() => {
      try {
        this.logger.info("[INFO] Reloading configuration...", true);
        this._loadConfiguration();
        this.logger.info("[INFO] Configuration reloaded successfully.", true);
      } catch (error) {
        this.logger.error(
          {
            message: "[ERROR] Failed to reload configuration:",
            error: error.message,
          },
          true
        );
      }
    }, 300);

    fs.watchFile(this.configurationPath, { interval: 500 }, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        reloadConfiguration();
      }
    });

    this.logger.info("[INFO] Watching configuration.json for changes...", true);
  }

  get() {
    return this.configuration;
  }

  async addRule(rule) {
    this.configurationValidator.assertValidRule(rule);

    if (this._ruleExists(rule)) {
      throw this.errorHandler.generateError({
        message: "Rule already exists",
        status: 400,
      });
    }

    this.configuration.rules.push(rule);
    this._writeConfiguration(this.configuration);
  }

  async updateDelayBlocks(delayBlocks) {
    if (Number(delayBlocks) < 0) {
      throw this.errorHandler.generateError({
        message: "Delay blocks must be a positive number",
        status: 400,
      });
    }

    this.configuration.delayBlocks = delayBlocks;
    this._writeConfiguration(this.configuration);
  }

  async updateRule(rule) {
    this.configurationValidator.assertValidRule(rule);

    const index = this._findRuleIndexById(rule.id);
    if (index === -1) {
      throw this.errorHandler.generateError({
        message: "Rule with that ID was not found",
        status: 404,
      });
    }

    this.configuration.rules[index] = rule;
    this._writeConfiguration(this.configuration);
  }

  async deleteRule(ruleId) {
    const index = this._findRuleIndexById(ruleId);
    if (index === -1) {
      throw this.errorHandler.generateError({
        message: "Rule with that ID was not found",
        status: 404,
      });
    }

    this.configuration.rules.splice(index, 1);
    this._writeConfiguration(this.configuration);
  }
}

module.exports = ConfigurationService;
