const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Time', {
    nome: { type: DataTypes.STRING, allowNull: false },
    logo: { type: DataTypes.STRING },
    qtd_jogadores: { type: DataTypes.INTEGER, defaultValue: 0 },
    tecnico_login: { type: DataTypes.STRING, unique: true },
    tecnico_senha: { type: DataTypes.STRING },
    inscrito_link: { type: DataTypes.BOOLEAN, defaultValue: false },
  });
};
