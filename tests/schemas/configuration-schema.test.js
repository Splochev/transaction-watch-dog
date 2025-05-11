const {
  ruleSchema,
  configurationSchema,
} = require("../../src/schemas/configuration");
const { z } = require("zod");

describe("Configuration Schema", () => {
  it("should validate a correct rule", () => {
    const validRule = {
      id: "rule-001",
      name: "Test Rule",
      enabled: true,
      match: { address: "0x123", topics: ["0x456"] },
    };

    expect(() => ruleSchema.parse(validRule)).not.toThrow();
  });

  it("should throw an error for an invalid rule", () => {
    const invalidRule = {
      id: "rule-001",
      name: "Test Rule",
      enabled: true,
      match: { address: 123 }, // Invalid address type
    };

    expect(() => ruleSchema.parse(invalidRule)).toThrow(z.ZodError);
  });

  it("should validate a correct configuration", () => {
    const validConfiguration = {
      delayBlocks: 5,
      rules: [
        {
          id: "rule-001",
          name: "Test Rule",
          enabled: true,
          match: { address: "0x123", topics: ["0x456"] },
        },
      ],
    };

    expect(() => configurationSchema.parse(validConfiguration)).not.toThrow();
  });

  it("should throw an error for an invalid configuration", () => {
    const invalidConfiguration = {
      delayBlocks: -1, // Invalid delayBlocks
      rules: [
        {
          id: "rule-001",
          name: "Test Rule",
          enabled: true,
          match: { address: "0x123", topics: ["0x456"] },
        },
      ],
    };

    expect(() => configurationSchema.parse(invalidConfiguration)).toThrow(
      z.ZodError
    );
  });

  it("should throw an error for invalid rule id format", () => {
    const invalidRule = {
      id: "rule 001", // Space not allowed
      name: "Test Rule",
      enabled: true,
      match: {},
    };
    expect(() => ruleSchema.parse(invalidRule)).toThrow(z.ZodError);
  });

  it("should allow a rule with missing optional match fields", () => {
    const validRule = {
      id: "rule-002",
      name: "No Match",
      enabled: true,
      match: {},
    };
    expect(() => ruleSchema.parse(validRule)).not.toThrow();
  });

  it("should throw an error for duplicate rule ids or names", () => {
    const invalidConfig = {
      delayBlocks: 1,
      rules: [
        {
          id: "dup",
          name: "Same",
          enabled: true,
          match: {},
        },
        {
          id: "dup", // Duplicate ID
          name: "Same", // Duplicate Name
          enabled: false,
          match: {},
        },
      ],
    };
    expect(() => configurationSchema.parse(invalidConfig)).toThrow(z.ZodError);
  });
});
