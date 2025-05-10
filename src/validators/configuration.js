class ConfigurationValidator {
  constructor({ errorHandler, configurationsSchema, configurationSchema }) {
    if (ConfigurationValidator.instance) {
      return ConfigurationValidator.instance;
    }

    this.configurationsSchema = configurationsSchema;
    this.configurationSchema = configurationSchema;
    this.errorHandler = errorHandler;

    ConfigurationValidator.instance = this;
  }

  assertValidConfigurations(configurations) {
    try {
      this.configurationsSchema.parse(configurations);
    } catch (error) {
      throw this.errorHandler.generateError({
        error: new Error(error),
        message: "Invalid configurations",
        status: 400,
      });
    }
  }

  assertValidConfiguration(configuration) {
    try {
      this.configurationSchema.parse(configuration);
    } catch (error) {
      throw this.errorHandler.generateError({
        error: new Error(error),
        message: "Invalid configuration",
        status: 400,
      });
    }
  }
}
module.exports = ConfigurationValidator;
