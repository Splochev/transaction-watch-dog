const { Router } = require("express");
const { makeInvoker } = require("awilix-express");
const configuration = require("../controllers/configuration");

const api = makeInvoker(configuration);
const router = Router();

router.get("/", api("get"));
router.get("/:id", api("getById"));
router.post("/", api("create"));
router.put("/", api("update"));
router.delete("/:id", api("delete"));

module.exports = router;
