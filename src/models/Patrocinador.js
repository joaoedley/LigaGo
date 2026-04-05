const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Patrocinador', {
    nome: { type: DataTypes.STRING, allowNull: false },
    logo: { type: DataTypes.STRING },
    link: { type: DataTypes.STRING },
  });
};
