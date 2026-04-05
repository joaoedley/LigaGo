const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Campeonato', {
    nome: { type: DataTypes.STRING, allowNull: false },
    descricao: { type: DataTypes.TEXT },
    logo: { type: DataTypes.STRING },
    banner: { type: DataTypes.STRING },
    max_times: { type: DataTypes.INTEGER, defaultValue: 0 },
    max_jogos: { type: DataTypes.INTEGER, defaultValue: 0 },
  });
};
