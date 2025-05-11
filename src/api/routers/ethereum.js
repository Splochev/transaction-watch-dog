const { Router } = require('express');
const { makeInvoker } = require('awilix-express');
const createController = require('../controllers/ethereum');

const api = makeInvoker(createController);
const router = Router();

router.get('/', api('get'));

module.exports = router;
