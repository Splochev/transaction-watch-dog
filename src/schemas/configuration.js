const { z } = require("zod");

const ruleSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]+$/, "Invalid ID format"),
  name: z.string(),
  enabled: z.boolean(),
  match: z.object({
    address: z.string().optional(), // Contract address to monitor
    topics: z.array(z.string()).optional() // Event topics to filter
  }),
});

const configurationSchema = z.object({
  delayBlocks: z.number().min(0, "Delay blocks must be at least 0"),
  rules: z.array(ruleSchema).refine(
    (rules) => {
      const ids = new Set();
      const names = new Set();

      for (const rule of rules) {
        if (ids.has(rule.id) || names.has(rule.name)) {
          return false;
        }
        ids.add(rule.id);
        names.add(rule.name);
      }

      return true;
    },
    {
      message: "Rules must have unique 'id' and 'name' values",
    }
  ),
});

module.exports = {
  ruleSchema,
  configurationSchema,
};
