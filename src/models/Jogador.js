const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Jogador', {
    nome: { type: DataTypes.STRING, allowNull: false },
    cpf: { type: DataTypes.STRING, unique: true },
    titulo_eleitor: { type: DataTypes.STRING },
    gols: { type: DataTypes.INTEGER, defaultValue: 0 },
    ca: { type: DataTypes.INTEGER, defaultValue: 0 }, // Cartão Amarelo
    cv: { type: DataTypes.INTEGER, defaultValue: 0 }, // Cartão Vermelho
    suspenso: { type: DataTypes.BOOLEAN, defaultValue: false },
    documento_url: { type: DataTypes.STRING },
    foto: { type: DataTypes.STRING },
  });
};
