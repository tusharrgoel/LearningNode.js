const Sequelize = require("sequelize");

const sequelize = new Sequelize("e-dukaan", "root", "Tushar@3103", {
  dialect: "mysql",
  host: "localhost",
});

module.exports = sequelize;