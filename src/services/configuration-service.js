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

    this.configurationsPath = this._getConfigurationsPath();
    this.configurations = [];

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
    this._ensureConfigurationsFileExists();
    this._loadConfigurations();
  }

  _ensureConfigurationsFileExists() {
    if (!fs.existsSync(this.configurationsPath)) {
      this._writeConfigurations([]);
    }
  }

  _loadConfigurations() {
    const fileContents = fs.readFileSync(this.configurationsPath, "utf8");
    const configurations = JSON.parse(fileContents);
    this.configurationValidator.assertValidConfigurations(configurations);
    this.configurations = configurations;

    // Emit an event whenever configurations are loaded or updated
    this.emit("configurationsUpdated", this.configurations);
  }

  _writeConfigurations(configurations) {
    fs.writeFileSync(
      this.configurationsPath,
      JSON.stringify(configurations, null, 2),
      "utf8"
    );
  }

  _configurationExists(configuration) {
    const { id, name, ...rest } = configuration;

    return this.configurations.some((config) => {
      const { id: configId, name: configName, ...configRest } = config;
      return (
        _.isEqual(rest, configRest) || id === configId || name === configName
      );
    });
  }

  _findConfigurationIndexById(configurationId) {
    return this.configurations.findIndex(
      (config) => config.id === configurationId
    );
  }

  _watchConfigurationsFile() {
    const reloadConfigurations = _.debounce(() => {
      try {
        this.logger.info("[INFO] Reloading configurations...", true);
        this._loadConfigurations();
        this.logger.info("[INFO] Configurations reloaded successfully.", true);
      } catch (error) {
        this.logger.error(
          {
            message: "[ERROR] Failed to reload configurations:",
            error: error.message,
          },
          true
        );
      }
    }, 300);

    fs.watchFile(this.configurationsPath, { interval: 500 }, (curr, prev) => {
      if (curr.mtime !== prev.mtime) {
        reloadConfigurations();
      }
    });

    this.logger.info("[INFO] Watching configuration.json for changes...", true);
  }

  get() {
    return this.configurations;
  }

  getById(configurationId) {
    const configuration = this.configurations.find(
      (config) => config.id === configurationId
    );

    if (!configuration) {
      throw this.errorHandler.generateError({
        message: "Configuration with that ID was not found",
        status: 404,
      });
    }
    return configuration;
  }

  async create(configuration) {
    this.configurationValidator.assertValidConfiguration(configuration);

    if (this._configurationExists(configuration)) {
      throw this.errorHandler.generateError({
        message: "Configuration already exists",
        status: 400,
      });
    }

    this.configurations.push(configuration);
    this._writeConfigurations(this.configurations);
  }

  async update(configuration) {
    this.configurationValidator.assertValidConfiguration(configuration);

    const index = this._findConfigurationIndexById(configuration.id);
    if (index === -1) {
      throw this.errorHandler.generateError({
        message: "Configuration with that ID was not found",
        status: 404,
      });
    }

    this.configurations[index] = configuration;
    this._writeConfigurations(this.configurations);
  }

  async delete(configurationId) {
    const index = this._findConfigurationIndexById(configurationId);
    if (index === -1) {
      throw this.errorHandler.generateError({
        message: "Configuration with that ID was not found",
        status: 404,
      });
    }

    this.configurations.splice(index, 1);
    this._writeConfigurations(this.configurations);
  }
}

module.exports = ConfigurationService;
