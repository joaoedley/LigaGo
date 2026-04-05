const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Arbitro', {
    nome: { type: DataTypes.STRING, allowNull: false },
  });
};
