const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Empresa', {
    nome: { type: DataTypes.STRING, allowNull: false },
    login: { type: DataTypes.STRING, unique: true, allowNull: false },
    senha: { type: DataTypes.STRING, allowNull: false },
    ativo: { type: DataTypes.BOOLEAN, defaultValue: true },
    isMaster: { type: DataTypes.BOOLEAN, defaultValue: false }
  });
};
