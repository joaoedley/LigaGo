const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('JogoEvento', {
    tipo: { type: DataTypes.STRING, allowNull: false },
    periodo: { type: DataTypes.STRING },
    minuto: { type: DataTypes.INTEGER },
  });
};
