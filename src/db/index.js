const path = require('path');

const db = require(path.join(__dirname, '../../models')); 
module.exports = db;
//This simply re-exports the Sequelize instance and models so DI can inject db everywhere.