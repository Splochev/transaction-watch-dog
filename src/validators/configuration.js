class ConfigurationValidator {
  constructor({ errorHandler, configurationSchema, ruleSchema }) {
    if (ConfigurationValidator.instance) {
      return ConfigurationValidator.instance;
    }

    this.configurationSchema = configurationSchema;
    this.ruleSchema = ruleSchema;
    this.errorHandler = errorHandler;

    ConfigurationValidator.instance = this;
  }

  assertValidConfiguration(configuration) {
    try {
      this.configurationSchema.parse(configuration);
    } catch (error) {
      throw this.errorHandler.generateError({
        error: new Error(error),
        message: error.message || "Invalid configuration",
        status: 400,
      });
    }
  }

  assertValidRule(rule) {
    try {
      this.ruleSchema.parse(rule);
    } catch (error) {
      throw this.errorHandler.generateError({
        error: new Error(error),
        message: error.message || "Invalid rule",
        status: 400,
      });
    }
  }
}
module.exports = ConfigurationValidator;
