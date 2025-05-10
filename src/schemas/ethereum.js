const { z } = require("zod");

const transactionHashesSchema = z.array(
  z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash")
);

const transactionsSchema = z.array(
  z.object({
    hash: z.string().regex(/^0x[a-fA-F0-9]{64}$/, "Invalid transaction hash"),
  })
);

module.exports = {
  transactionHashesSchema,
  transactionsSchema,
};