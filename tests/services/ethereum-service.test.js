const { ethers } = require("ethers");
const EthereumService = require("../../src/services/ethereum-service");

jest.mock("ethers", () => ({
  ethers: {
    JsonRpcProvider: jest.fn(),
  },
}));

describe("EthereumService", () => {
  let logger;
  let errorHandler;
  let db;
  let configurationService;
  let originalApiKey;

  beforeEach(() => {
    // reset singleton
    delete EthereumService.instance;

    // capture and clear API_KEY
    originalApiKey = process.env.API_KEY;
    delete process.env.API_KEY;

    // common mocks
    logger = { info: jest.fn(), error: jest.fn() };
    errorHandler = {
      generateError: jest.fn(({ message, status }) => {
        const e = new Error(message);
        e.status = status;
        return e;
      }),
    };
    // stubbed Sequelize model
    db = {
      Transaction: {
        bulkCreate: jest.fn(),
        findAndCountAll: jest.fn(),
      },
    };
    configurationService = {
      get: jest.fn().mockReturnValue({ rules: [], delayBlocks: 0 }),
      on: jest.fn(),
      off: jest.fn(),
    };

    // mock provider
    ethers.JsonRpcProvider.mockImplementation(() => ({
      on: jest.fn(),
      getLogs: jest.fn(),
    }));
  });

  afterEach(() => {
    process.env.API_KEY = originalApiKey;
    jest.resetAllMocks();
  });

  it("throws if dependencies are missing", () => {
    expect(() => new EthereumService({})).toThrow(
      "[ERROR] Failed to initialize dependencies"
    );
  });

  it("throws if API_KEY is not set", () => {
    // provide dependencies but no API_KEY
    expect(
      () =>
        new EthereumService({
          logger,
          errorHandler,
          db,
          configurationService,
        })
    ).toThrow("[ERROR] Failed to initialize provider: API_KEY is not set");
  });

  it("is a singleton", () => {
    process.env.API_KEY = "foo";
    const svc1 = new EthereumService({
      logger,
      errorHandler,
      db,
      configurationService,
    });
    const svc2 = new EthereumService({
      logger,
      errorHandler,
      db,
      configurationService,
    });
    expect(svc1).toBe(svc2);
  });

  describe("_processLog", () => {
    it("maps a log + ruleId to the correct shape", () => {
      process.env.API_KEY = "foo";
      const svc = new EthereumService({
        logger,
        errorHandler,
        db,
        configurationService,
      });
      const log = {
        blockNumber: 10,
        blockHash: "0xhash",
        transactionHash: "0xtx",
        address: "0xaddr",
        data: "0xdata",
        topics: ["t1", "t2"],
      };
      const out = svc._processLog(log, "rule-123");
      expect(out).toEqual({
        blockNumber: 10,
        blockHash: "0xhash",
        transactionHash: "0xtx",
        address: "0xaddr",
        data: "0xdata",
        topics: ["t1", "t2"],
        ruleId: "rule-123",
      });
    });
  });

  describe("insertTransaction()", () => {
    beforeEach(() => {
      process.env.API_KEY = "foo";
    });

    it("no-ops on empty or null transactions", async () => {
      const svc = new EthereumService({
        logger,
        errorHandler,
        db,
        configurationService,
      });

      await svc.insertTransaction([]);
      await svc.insertTransaction(null);
      expect(db.Transaction.bulkCreate).not.toHaveBeenCalled();
    });

    it("dedups and calls bulkCreate", async () => {
      const svc = new EthereumService({
        logger,
        errorHandler,
        db,
        configurationService,
      });

      const txs = [
        { transactionHash: "a", foo: 1 },
        { transactionHash: "b", foo: 2 },
        { transactionHash: "a", foo: 3 },
      ];
      await svc.insertTransaction(txs);
      // should dedupe by transactionHash, preserving last entry for 'a'
      expect(db.Transaction.bulkCreate).toHaveBeenCalledWith(
        [
          { transactionHash: "a", foo: 3 },
          { transactionHash: "b", foo: 2 },
        ],
        {
          updateOnDuplicate: [
            "blockNumber",
            "blockHash",
            "address",
            "data",
            "topics",
            "ruleId",
            "updatedAt",
          ],
        }
      );
    });

    it("logs errors without throwing", async () => {
      const svc = new EthereumService({
        logger,
        errorHandler,
        db,
        configurationService,
      });
      db.Transaction.bulkCreate.mockRejectedValue(new Error("DB down"));
      await svc.insertTransaction([{ transactionHash: "x" }]);
      expect(logger.error).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "[ERROR] Failed to insert transactions:",
        })
      );
    });
  });

  describe("get()", () => {
    beforeEach(() => {
      process.env.API_KEY = "foo";
    });

    it("builds correct query and returns rows", async () => {
      const svc = new EthereumService({
        logger,
        errorHandler,
        db,
        configurationService,
      });
      const fake = { rows: [{ id: 1 }], count: 1 };
      db.Transaction.findAndCountAll.mockResolvedValue(fake);

      const result = await svc.get({
        transactionHash: "0xabc",
        blockNumber: 123,
        page: 2,
        ruleId: "r1",
        orderBy: "blockNumber",
        sortType: "ASC",
      });

      expect(db.Transaction.findAndCountAll).toHaveBeenCalledWith({
        where: {
          transactionHash: "0xabc",
          blockNumber: 123,
          ruleId: "r1",
        },
        limit: 100,
        offset: 100,
        order: [["blockNumber", "ASC"]],
      });
      expect(result).toEqual([{ id: 1 }]);
    });

    it("uses defaults when optional missing", async () => {
      const svc = new EthereumService({
        logger,
        errorHandler,
        db,
        configurationService,
      });
      db.Transaction.findAndCountAll.mockResolvedValue({ rows: [] });

      const result = await svc.get({});

      expect(db.Transaction.findAndCountAll).toHaveBeenCalledWith({
        where: {},
        limit: 100,
        offset: 0,
        order: [["createdAt", "DESC"]],
      });
      expect(result).toEqual([]);
    });

    it("wraps and rethrows errors via errorHandler", async () => {
      const svc = new EthereumService({
        logger,
        errorHandler,
        db,
        configurationService,
      });
      const inner = new Error("DB fail");
      db.Transaction.findAndCountAll.mockRejectedValue(inner);

      await expect(svc.get({})).rejects.toBeInstanceOf(Error);
      expect(errorHandler.generateError).toHaveBeenCalledWith({
        message: "Failed to get transactions",
        status: 500,
        error: inner,
      });
    });
  });
});
