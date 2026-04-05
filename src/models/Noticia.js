const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Noticia', {
    titulo: { type: DataTypes.STRING, allowNull: false },
    conteudo: { type: DataTypes.TEXT },
    imagem: { type: DataTypes.STRING },
    expiresAt: { type: DataTypes.DATE },
  });
};
