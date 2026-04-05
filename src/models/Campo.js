const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Campo', {
    nome: { type: DataTypes.STRING, allowNull: false },
    localizacao: { type: DataTypes.STRING },
  });
};
