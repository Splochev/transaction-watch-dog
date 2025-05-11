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
      const issues = error.issues.map((issue) => {
        return `${issue.code}, expected ${issue.expected}, received ${issue.received} for fields [${issue.path.join(", ")}]`;
      });

      throw this.errorHandler.generateError({
        message: issues.join("; \n"),
        status: 400,
      });
    }
  }

  assertValidRule(rule) {
    try {
      this.ruleSchema.parse(rule);
    } catch (error) {
      const issues = error.issues.map((issue) => {
        return `${issue.code}, expected ${issue.expected}, received ${issue.received} for fields [${issue.path.join(", ")}]`;
      });

      throw this.errorHandler.generateError({
        message: issues.join("; \n"),
        status: 400,
      });
    }
  }
}
module.exports = ConfigurationValidator;
