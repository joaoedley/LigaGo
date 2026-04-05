const { Empresa, Campeonato, Categoria, Time, Jogador, Jogo, JogoEvento, Patrocinador, Noticia } = require('../models');
const { createChampionshipSchema } = require('../validators/ChampionshipValidator');
const { createTeamSchema } = require('../validators/TeamValidator');
const { createPlayerSchema } = require('../validators/PlayerValidator');

class ChampionshipController {
  // Championships
  async listChampionships(req, res) {
    const empresa = await Empresa.findByPk(req.user.id);
    if (!empresa) return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    const championships = await Campeonato.findAll({ where: { empresa_id: req.user.id } });
    res.json(championships);
  }

  async createChampionship(req, res) {
    try {
      const empresa = await Empresa.findByPk(req.user.id);
      if (!empresa) return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
      
      const validatedData = createChampionshipSchema.parse(req.body);
      const { nome, max_times, max_jogos } = validatedData;
      
      const logo = req.files?.logo?.[0] ? `/uploads/championships/logos/${req.files.logo[0].filename}` : (req.body.logo || null);
      const banner = req.files?.banner?.[0] ? `/uploads/championships/banners/${req.files.banner[0].filename}` : (req.body.banner || null);

      const championship = await Campeonato.create({ 
        nome, 
        logo,
        banner,
        max_times, 
        max_jogos, 
        empresa_id: req.user.id 
      });
      res.json(championship);
    } catch (err) {
      if (err.errors) return res.status(400).json({ error: err.errors[0].message });
      res.status(400).json({ name: err.name, error: err.message });
    }
  }

  async deleteChampionship(req, res) {
    const empresa = await Empresa.findByPk(req.user.id);
    if (!empresa) return res.status(401).json({ error: 'Sessão expirada. Faça login novamente.' });
    await Campeonato.destroy({ where: { id: req.params.id, empresa_id: req.user.id } });
    res.json({ message: 'Campeonato removido' });
  }

  // Categories
  async listCategories(req, res) {
    const categories = await Categoria.findAll({ where: { campeonato_id: req.params.championshipId } });
    res.json(categories);
  }

  async createCategory(req, res) {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
    const category = await Categoria.create({ nome, campeonato_id: req.params.championshipId });
    res.json(category);
  }

  async deleteCategory(req, res) {
    await Categoria.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Categoria removida' });
  }

  // Teams
  async listTeamsByCategory(req, res) {
    const teams = await Time.findAll({ where: { categoria_id: req.params.categoryId } });
    res.json(teams);
  }

  async createTeam(req, res) {
    try {
      const validatedData = createTeamSchema.parse(req.body);
      const { nome, qtd_jogadores } = validatedData;
      const logo = req.file ? `/uploads/teams/${req.file.filename}` : (req.body.logo || null);
      
      const team = await Time.create({ 
        nome, 
        logo, 
        qtd_jogadores,
        categoria_id: req.params.categoryId 
      });
      res.json(team);
    } catch (err) {
      if (err.errors) return res.status(400).json({ error: err.errors[0].message });
      res.status(400).json({ name: err.name, error: err.message });
    }
  }

  async deleteTeam(req, res) {
    await Time.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Time removido' });
  }

  // Games
  async listGamesByCategory(req, res) {
    const games = await Jogo.findAll({ 
      where: { categoria_id: req.params.categoryId },
      include: [
        { model: Time, as: 'Time1' },
        { model: Time, as: 'Time2' }
      ]
    });
    res.json(games);
  }

  async generateGames(req, res) {
    const { categoryId } = req.params;
    const teams = await Time.findAll({ where: { categoria_id: categoryId } });
    
    if (teams.length < 2) return res.status(400).json({ error: 'Mínimo de 2 times para gerar jogos' });

    const games = [];
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        games.push({
          categoria_id: categoryId,
          time1_id: teams[i].id,
          time2_id: teams[j].id,
          data: new Date(),
          rodada: 1,
          gols_time1: 0,
          gols_time2: 0,
          finalizado: false
        });
      }
    }
    
    await Jogo.bulkCreate(games);
    res.json({ message: `${games.length} jogos gerados com sucesso` });
  }

  async updateGame(req, res) {
    try {
      const { id } = req.params;
      const { gols_time1, gols_time2, finalizado, data, arbitro_id, campo_id } = req.body;
      
      const game = await Jogo.findByPk(id);
      if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });

      const wasFinalized = game.finalizado;
      const isFinalizing = finalizado === true || finalizado === 'true';

      await game.update({
        gols_time1: parseInt(gols_time1) ?? game.gols_time1,
        gols_time2: parseInt(gols_time2) ?? game.gols_time2,
        finalizado: isFinalizing,
        data: data ?? game.data,
        arbitro_id: arbitro_id ?? game.arbitro_id,
        campo_id: campo_id ?? game.campo_id
      });

      // Se o jogo acabou de ser finalizado, computar estatísticas dos jogadores
      if (!wasFinalized && isFinalizing) {
        const events = await JogoEvento.findAll({ where: { jogo_id: id } });
        
        for (const event of events) {
          if (!event.jogador_id) continue;
          
          const player = await Jogador.findByPk(event.jogador_id);
          if (!player) continue;

          console.log(`Processing event: ${event.tipo} for player: ${player.nome}`);

          if (event.tipo === 'gol') {
            await player.increment('gols');
          } else if (event.tipo === 'amarelo' || event.tipo === 'ca') {
            await player.increment('ca');
          } else if (event.tipo === 'vermelho' || event.tipo === 'cv') {
            await player.increment('cv');
            await player.update({ suspenso: true });
          }
        }
      }

      res.json(game);
    } catch (err) {
      console.error('updateGame Error:', err);
      res.status(400).json({ error: err.message });
    }
  }

  async getGameDetails(req, res) {
    try {
      const { id } = req.params;
      const game = await Jogo.findByPk(id, {
        include: [
          { model: Time, as: 'Time1', include: [{ model: Jogador, as: 'Jogadores' }] },
          { model: Time, as: 'Time2', include: [{ model: Jogador, as: 'Jogadores' }] },
          { model: JogoEvento, as: 'Eventos', include: [Time, Jogador] }
        ]
      });
      if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });
      res.json(game);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async addGameEvent(req, res) {
    try {
      const { id } = req.params;
      const { tipo, time_id, jogador_id, periodo, minuto } = req.body;
      const event = await JogoEvento.create({
        jogo_id: id,
        tipo,
        time_id,
        jogador_id,
        periodo,
        minuto
      });

      // Se for um gol, atualizar automaticamente o placar do jogo
      if (tipo === 'gol') {
        const game = await Jogo.findByPk(id);
        if (game.time1_id === parseInt(time_id)) {
          await game.increment('gols_time1');
        } else if (game.time2_id === parseInt(time_id)) {
          await game.increment('gols_time2');
        }
      }

      res.json(event);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteGameEvent(req, res) {
    try {
      const { eventId } = req.params;
      const event = await JogoEvento.findByPk(eventId);
      if (!event) return res.status(404).json({ error: 'Evento não encontrado' });

      // Se for um gol, decrementar o placar
      if (event.tipo === 'gol') {
        const game = await Jogo.findByPk(event.jogo_id);
        if (game.time1_id === event.time_id) {
          await game.decrement('gols_time1');
        } else if (game.time2_id === event.time_id) {
          await game.decrement('gols_time2');
        }
      }

      await event.destroy();
      res.json({ message: 'Evento removido' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Sponsors
  async listSponsors(req, res) {
    const sponsors = await Patrocinador.findAll({ where: { campeonato_id: req.params.championshipId } });
    res.json(sponsors);
  }

  async createSponsor(req, res) {
    try {
      const { nome, link } = req.body;
      const logo = req.file ? `/uploads/sponsors/${req.file.filename}` : null;
      const sponsor = await Patrocinador.create({
        nome,
        logo,
        link,
        campeonato_id: req.params.championshipId
      });
      res.json(sponsor);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteSponsor(req, res) {
    await Patrocinador.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Patrocinador removido' });
  }

  // News
  async listNews(req, res) {
    const news = await Noticia.findAll({ where: { campeonato_id: req.params.championshipId } });
    res.json(news);
  }

  async createNews(req, res) {
    try {
      const { titulo, conteudo } = req.body;
      const imagem = req.file ? `/uploads/news/${req.file.filename}` : null;
      const news = await Noticia.create({
        titulo,
        conteudo,
        imagem,
        campeonato_id: req.params.championshipId
      });
      res.json(news);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // Players (restored)
  async listPlayersByTeam(req, res) {
    const players = await Jogador.findAll({ where: { time_id: req.params.teamId } });
    res.json(players);
  }

  async listPlayersByCategory(req, res) {
    try {
      const players = await Jogador.findAll({
        include: [
          {
            model: Time,
            where: { categoria_id: req.params.categoryId },
          }
        ],
        order: [['createdAt', 'DESC']]
      });
      res.json(players);
    } catch (err) {
      res.status(400).json({ name: err.name, error: err.message });
    }
  }

  async createPlayer(req, res) {
    try {
      const validatedData = createPlayerSchema.parse(req.body);
      const { nome, cpf, titulo_eleitor } = validatedData;
      const player = await Jogador.create({ 
        nome, 
        cpf: cpf || null, 
        titulo_eleitor: titulo_eleitor || null, 
        time_id: req.params.teamId 
      });
      res.json(player);
    } catch (err) {
      if (err.errors) return res.status(400).json({ error: err.errors[0].message });
      res.status(400).json({ name: err.name, error: err.message });
    }
  }

  async deletePlayer(req, res) {
    await Jogador.destroy({ where: { id: req.params.id } });
    res.json({ message: 'Jogador removido' });
  }
}

module.exports = new ChampionshipController();
