const { Campeonato, Categoria, Time, Jogo, Jogador, JogoEvento, Patrocinador, Noticia, Campo } = require('../models');
const StandingsService = require('../services/StandingsService');

class PublicController {
  async listChampionships(req, res) {
    try {
      const championships = await Campeonato.findAll();
      res.json(championships);
    } catch (err) {
      console.error('listChampionships Error:', err);
      res.status(500).json({ error: err.message });
    }
  }

  async getChampionshipDetails(req, res) {
    try {
      const { id } = req.params;
      const championship = await Campeonato.findByPk(id, {
        include: [
          { model: Categoria, as: 'Categorias' },
          { model: Patrocinador, as: 'Patrocinadores' },
          { model: Noticia, as: 'Noticias' }
        ]
      });
      if (!championship) return res.status(404).json({ error: 'Campeonato não encontrado' });
      res.json(championship);
    } catch (err) {
      console.error('getChampionshipDetails Error:', err);
      res.status(500).json({ error: err.message });
    }
  }

  async getStandings(req, res) {
    try {
      const { categoryId } = req.params;
      const standings = await StandingsService.calculateStandings(categoryId);
      res.json(standings);
    } catch (err) {
      console.error('getStandings Error:', err);
      res.status(500).json({ error: err.message });
    }
  }

  async getGames(req, res) {
    try {
      const { categoryId } = req.params;
      const games = await Jogo.findAll({
        where: { categoria_id: categoryId },
        include: [
          { model: Time, as: 'Time1' },
          { model: Time, as: 'Time2' },
          { model: Campo },
          { model: JogoEvento, as: 'Eventos', include: [Time, Jogador] }
        ],
        order: [['data', 'ASC']]
      });
      res.json(games);
    } catch (err) {
      console.error('getGames Error:', err);
      res.status(500).json({ error: err.message });
    }
  }

  async getGameDetails(req, res) {
    try {
      const { id } = req.params;
      const game = await Jogo.findByPk(id, {
        include: [
          { model: Time, as: 'Time1', include: [{ model: Jogador, as: 'Jogadores' }] },
          { model: Time, as: 'Time2', include: [{ model: Jogador, as: 'Jogadores' }] },
          { model: Campo },
          { model: JogoEvento, as: 'Eventos', include: [Time, Jogador] }
        ]
      });
      if (!game) return res.status(404).json({ error: 'Jogo não encontrado' });
      res.json(game);
    } catch (err) {
      console.error('getGameDetails Error:', err);
      res.status(400).json({ error: err.message });
    }
  }

  async getScorers(req, res) {
    try {
      const { categoryId } = req.params;
      const players = await Jogador.findAll({
        include: [
          { 
            model: Time, 
            where: { categoria_id: categoryId },
            required: true 
          }
        ],
        order: [['gols', 'DESC']],
        limit: 10
      });
      res.json(players);
    } catch (err) {
      console.error('getScorers Error:', err);
      res.status(500).json({ error: err.message });
    }
  }

  async getTeams(req, res) {
    try {
      const { categoryId } = req.params;
      const teams = await Time.findAll({
        where: { categoria_id: categoryId },
        include: [{ model: Jogador, as: 'Jogadores' }]
      });
      res.json(teams);
    } catch (err) {
      console.error('getTeams Error:', err);
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = new PublicController();
