const { Sequelize } = require('sequelize');
const path = require('path');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  protocol: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
});

// Import models
const EmpresaModel = require('./Empresa');
const CampeonatoModel = require('./Campeonato');
const CategoriaModel = require('./Categoria');
const TimeModel = require('./Time');
const JogadorModel = require('./Jogador');
const ArbitroModel = require('./Arbitro');
const CampoModel = require('./Campo');
const JogoModel = require('./Jogo');
const JogoEventoModel = require('./JogoEvento');
const PatrocinadorModel = require('./Patrocinador');
const NoticiaModel = require('./Noticia');

// Initialize models
const Empresa = EmpresaModel(sequelize);
const Campeonato = CampeonatoModel(sequelize);
const Categoria = CategoriaModel(sequelize);
const Time = TimeModel(sequelize);
const Jogador = JogadorModel(sequelize);
const Arbitro = ArbitroModel(sequelize);
const Campo = CampoModel(sequelize);
const Jogo = JogoModel(sequelize);
const JogoEvento = JogoEventoModel(sequelize);
const Patrocinador = PatrocinadorModel(sequelize);
const Noticia = NoticiaModel(sequelize);

// --- Relationships ---

// Empresa <-> Campeonato
Empresa.hasMany(Campeonato, { foreignKey: 'empresa_id', as: 'Campeonatos' });
Campeonato.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Campeonato <-> Categoria
Campeonato.hasMany(Categoria, { foreignKey: 'campeonato_id', as: 'Categorias' });
Categoria.belongsTo(Campeonato, { foreignKey: 'campeonato_id' });

// Categoria <-> Time
Categoria.hasMany(Time, { foreignKey: 'categoria_id', as: 'Times' });
Time.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// Time <-> Jogador
Time.hasMany(Jogador, { foreignKey: 'time_id', as: 'Jogadores' });
Jogador.belongsTo(Time, { foreignKey: 'time_id' });

// Categoria <-> Jogo
Categoria.hasMany(Jogo, { foreignKey: 'categoria_id', as: 'Jogos' });
Jogo.belongsTo(Categoria, { foreignKey: 'categoria_id' });

// Time <-> Jogo (Mandante/Visitante)
Time.hasMany(Jogo, { as: 'JogosMandante', foreignKey: 'time1_id' });
Time.hasMany(Jogo, { as: 'JogosVisitante', foreignKey: 'time2_id' });
Jogo.belongsTo(Time, { as: 'Time1', foreignKey: 'time1_id' });
Jogo.belongsTo(Time, { as: 'Time2', foreignKey: 'time2_id' });

// Empresa <-> Arbitro
Empresa.hasMany(Arbitro, { foreignKey: 'empresa_id', as: 'Arbitros' });
Arbitro.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Empresa <-> Campo
Empresa.hasMany(Campo, { foreignKey: 'empresa_id', as: 'Campos' });
Campo.belongsTo(Empresa, { foreignKey: 'empresa_id' });

// Jogo <-> Arbitro/Campo
Jogo.belongsTo(Arbitro, { foreignKey: 'arbitro_id' });
Jogo.belongsTo(Campo, { foreignKey: 'campo_id' });

// Jogo <-> JogoEvento
Jogo.hasMany(JogoEvento, { foreignKey: 'jogo_id', as: 'Eventos' });
JogoEvento.belongsTo(Jogo, { foreignKey: 'jogo_id' });

// Time <-> JogoEvento
Time.hasMany(JogoEvento, { foreignKey: 'time_id', as: 'Eventos' });
JogoEvento.belongsTo(Time, { foreignKey: 'time_id' });

// Jogador <-> JogoEvento
Jogador.hasMany(JogoEvento, { foreignKey: 'jogador_id', as: 'Eventos' });
JogoEvento.belongsTo(Jogador, { foreignKey: 'jogador_id' });

// Campeonato <-> Patrocinador
Campeonato.hasMany(Patrocinador, { foreignKey: 'campeonato_id', as: 'Patrocinadores' });
Patrocinador.belongsTo(Campeonato, { foreignKey: 'campeonato_id' });

// Campeonato <-> Noticia
Campeonato.hasMany(Noticia, { foreignKey: 'campeonato_id', as: 'Noticias' });
Noticia.belongsTo(Campeonato, { foreignKey: 'campeonato_id' });

module.exports = {
  sequelize,
  Empresa,
  Campeonato,
  Categoria,
  Time,
  Jogador,
  Jogo,
  JogoEvento,
  Arbitro,
  Campo,
  Patrocinador,
  Noticia
};
