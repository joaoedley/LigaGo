const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Jogo', {
    gols_time1: { type: DataTypes.INTEGER, defaultValue: 0 },
    gols_time2: { type: DataTypes.INTEGER, defaultValue: 0 },
    data: { type: DataTypes.DATE, allowNull: false },
    finalizado: { type: DataTypes.BOOLEAN, defaultValue: false },
    rodada: { type: DataTypes.INTEGER, defaultValue: 1 },
    transmissao_url: { type: DataTypes.STRING },
    sumula_url: { type: DataTypes.STRING },
  });
};
