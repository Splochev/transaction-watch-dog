const { ruleSchema, configurationSchema } = require("../../src/schemas/configuration");
const { z } = require("zod");

describe("Configuration Schema (with Ethereum address and topic validation)", () => {
  const validAddress = "0x" + "a".repeat(40);
  const validTopic = "0x" + "b".repeat(64);

  it("should validate a rule with full Ethereum address and topic", () => {
    const validRule = {
      id: "rule-001",
      name: "Valid Rule",
      enabled: true,
      match: { address: validAddress, topics: [validTopic] },
    };
    expect(() => ruleSchema.parse(validRule)).not.toThrow();
  });

  it("should throw for rule with invalid Ethereum address", () => {
    const invalidRule = {
      id: "rule-002",
      name: "Bad Address",
      enabled: true,
      match: { address: "0x1234" },
    };
    expect(() => ruleSchema.parse(invalidRule)).toThrow(z.ZodError);
  });

  it("should throw for rule with invalid topic format", () => {
    const invalidRule = {
      id: "rule-003",
      name: "Bad Topic",
      enabled: true,
      match: { address: validAddress, topics: ["1234"] },
    };
    expect(() => ruleSchema.parse(invalidRule)).toThrow(z.ZodError);
  });

  it("should allow a rule with missing match fields", () => {
    const noMatchRule = {
      id: "rule-004",
      name: "No Match",
      enabled: false,
      match: {},
    };
    expect(() => ruleSchema.parse(noMatchRule)).not.toThrow();
  });

  it("should throw for invalid rule id format", () => {
    const invalidRule = {
      id: "rule 005",
      name: "Invalid ID",
      enabled: true,
      match: {},
    };
    expect(() => ruleSchema.parse(invalidRule)).toThrow(z.ZodError);
  });

  it("should validate a correct configuration with multiple rules", () => {
    const config = {
      delayBlocks: 0,
      rules: [
        { id: "r1", name: "One", enabled: true, match: {} },
        { id: "r2", name: "Two", enabled: false, match: { address: validAddress } },
      ],
    };
    expect(() => configurationSchema.parse(config)).not.toThrow();
  });

  it("should throw for configuration with negative delayBlocks", () => {
    const config = { delayBlocks: -5, rules: [] };
    expect(() => configurationSchema.parse(config)).toThrow(z.ZodError);
  });

  it("should throw for duplicate rule ids or names in configuration", () => {
    const config = {
      delayBlocks: 1,
      rules: [
        { id: "dup", name: "Same", enabled: true, match: {} },
        { id: "dup", name: "AlsoSame", enabled: true, match: {} },
      ],
    };
    expect(() => configurationSchema.parse(config)).toThrow(z.ZodError);

    const config2 = {
      delayBlocks: 1,
      rules: [
        { id: "u1", name: "dupName", enabled: true, match: {} },
        { id: "u2", name: "dupName", enabled: true, match: {} },
      ],
    };
    expect(() => configurationSchema.parse(config2)).toThrow(z.ZodError);
  });

  it("should allow delayBlocks boundary of zero", () => {
    const config = { delayBlocks: 0, rules: [] };
    expect(() => configurationSchema.parse(config)).not.toThrow();
  });
});