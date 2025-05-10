const { z } = require("zod");

const configurationSchema = z.object({
  id: z.string().regex(/^[a-zA-Z0-9-]+$/, "Invalid ID format"),
  name: z.string(),
  enabled: z.boolean(),
  match: z.object({}),
  delayBlocks: z.number().min(0),
  createdAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  updatedAt: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
});

const configurationsSchema = z.array(configurationSchema);

module.exports = {
  configurationSchema,
  configurationsSchema,
};
