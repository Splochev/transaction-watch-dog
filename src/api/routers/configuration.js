const { Router } = require("express");
const { makeInvoker } = require("awilix-express");
const configuration = require("../controllers/configuration");

const api = makeInvoker(configuration);
const router = Router();

router.get("/", api("get"));
router.post("/", api("addRule"));
router.put("/", api("updateRule"));
router.put("/delay-blocks", api("updateDelayBlocks"));
router.delete("/:id", api("deleteRule"));

module.exports = router;
