const createController = require("../../src/api/controllers/ethereum");

describe("Ethereum Controller", () => {
  let controller;
  let ethereumService;
  let req;
  let res;
  let next;

  beforeEach(() => {
    ethereumService = {
      get: jest.fn(),
    };
    controller = createController({ ethereumService });

    req = { query: {} };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
  });

  describe("get", () => {
    it("should call ethereumService.get with query params and return 200/json", async () => {
      const fakeResult = [{ tx: "0xabc" }];
      // set up query parameters
      req.query = {
        transactionHash: "0xabc",
        blockNumber: "123",
        page: "2",
        ruleId: "rule-1",
        orderBy: "blockNumber",
        sortType: "ASC",
      };
      ethereumService.get.mockResolvedValue(fakeResult);

      await controller.get(req, res, next);

      expect(ethereumService.get).toHaveBeenCalledWith({
        transactionHash: "0xabc",
        blockNumber: "123",
        page: "2",
        ruleId: "rule-1",
        orderBy: "blockNumber",
        sortType: "ASC",
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeResult);
      expect(next).not.toHaveBeenCalled();
    });

    it("should default orderBy and sortType when not provided", async () => {
      const fakeResult = [];
      req.query = {
        transactionHash: "0xdef",
      };
      ethereumService.get.mockResolvedValue(fakeResult);

      await controller.get(req, res, next);

      expect(ethereumService.get).toHaveBeenCalledWith({
        transactionHash: "0xdef",
        blockNumber: undefined,
        page: undefined,
        ruleId: undefined,
        orderBy: undefined,
        sortType: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(fakeResult);
    });

    it("should forward errors to next()", async () => {
      const err = new Error("DB failure");
      ethereumService.get.mockRejectedValue(err);

      await controller.get(req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });
});
