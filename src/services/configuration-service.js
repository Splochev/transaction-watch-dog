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

    try {
      this._initialize();
      this._watchConfigurationsFile();
    } catch (error) {
      this.logger.error({
        message: "[ERROR] Failed to initialize ConfigurationService:",
        error: error
      });
    }

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
    try {
      this._ensureConfigurationFileExists();
      this.configuration = this._loadConfiguration();
    } catch (error) {
      this.logger.error({
        message: "[ERROR] Failed to initialize configuration:",
        error: error
      });
      throw error;
    }
  }

  _ensureConfigurationFileExists() {
    try {
      if (!fs.existsSync(this.configurationPath)) {
        this._writeConfiguration({
          delayBlocks: 0,
          rules: [],
        });
      }
    } catch (error) {
      this.logger.error({
        message: "[ERROR] Failed to ensure configuration file exists:",
        error: error
      });
      throw error;
    }
  }

  _loadConfiguration() {
    try {
      const fileContents = fs.readFileSync(this.configurationPath, "utf8");
      const configuration = JSON.parse(fileContents);
      this.configurationValidator.assertValidConfiguration(configuration);
      this.emit("configurationUpdated", configuration);
      return configuration;
    } catch (error) {
      this.logger.error({
        message: "[ERROR] Failed to load configuration:",
        error: error
      });
      throw error;
    }
  }

  _writeConfiguration(configuration) {
    try {
      fs.writeFileSync(
        this.configurationPath,
        JSON.stringify(configuration, null, 2),
        "utf8"
      );
    } catch (error) {
      this.logger.error({
        message: "[ERROR] Failed to write configuration:",
        error: error
      });
      throw error;
    }
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
        this.logger.info("[INFO] Reloading configuration...");
        this.configuration = this._loadConfiguration();
        this.logger.info("[INFO] Configuration reloaded successfully.");
      } catch (error) {
        this.logger.error({
          message: "[ERROR] Failed to reload configuration:",
          error: error.message,
        });
      }
    }, 300);

    try {
      fs.watchFile(this.configurationPath, { interval: 500 }, (curr, prev) => {
        if (curr.mtime !== prev.mtime) {
          reloadConfiguration();
        }
      });

      this.logger.info("[INFO] Watching configuration.json for changes...");
    } catch (error) {
      this.logger.error({
        message: "[ERROR] Failed to watch configuration file:",
        error: error
      });
      throw error;
    }
  }

  cleanup() {
    try {
      fs.unwatchFile(this.configurationPath);
      this.logger.info("[INFO] Stopped watching configuration.json for changes.");
    } catch (error) {
      this.logger.error({
        message: "[ERROR] Failed to cleanup configuration watcher:",
        error: error
      });
    }
  }

  get() {
    return _.cloneDeep(this.configuration);
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
      if (Number(delayBlocks) < 0 || isNaN(Number(delayBlocks))) {
        throw this.errorHandler.generateError({
          message: "Delay blocks must be a positive number",
          status: 400,
        });
      }

      this.configuration.delayBlocks = Number(delayBlocks);
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
