const _ = require("lodash");
const path = require("path");
const fs = require("fs");

class ConfigurationService {
  constructor({ logger, errorHandler, configurationValidator }) {
    if (ConfigurationService.instance) {
      return ConfigurationService.instance;
    }

    this.logger = logger;
    this.errorHandler = errorHandler;
    this.configurationValidator = configurationValidator;

    this.configurationsPath = this._getConfigurationsPath();
    this.configurations = [];

    this._initialize();

    ConfigurationService.instance = this;
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
      return _.isEqual(rest, configRest);
    });
  }

  _findConfigurationIndexById(configurationId) {
    return this.configurations.findIndex(
      (config) => config.id === configurationId
    );
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
