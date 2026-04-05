const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Categoria', {
    nome: { type: DataTypes.STRING, allowNull: false },
  });
};
