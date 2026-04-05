const { Jogo, Time } = require('../models');

class StandingsService {
  async calculateStandings(categoryId) {
    const teams = await Time.findAll({ where: { categoria_id: categoryId } });
    const games = await Jogo.findAll({ 
      where: { 
        categoria_id: categoryId,
        finalizado: true
      } 
    });

    const standings = teams.map(team => ({
      id: team.id,
      nome: team.nome,
      logo: team.logo,
      pj: 0, // Partidas Jogadas
      v: 0,  // Vitórias
      e: 0,  // Empates
      d: 0,  // Derrotas
      gp: 0, // Gols Pró
      gc: 0, // Gols Contra
      sg: 0, // Saldo de Gols
      pts: 0 // Pontos
    }));

    games.forEach(game => {
      const homeTeam = standings.find(s => s.id === game.time1_id);
      const awayTeam = standings.find(s => s.id === game.time2_id);

      if (homeTeam && awayTeam) {
        homeTeam.pj++;
        awayTeam.pj++;
        homeTeam.gp += game.gols_time1;
        homeTeam.gc += game.gols_time2;
        awayTeam.gp += game.gols_time2;
        awayTeam.gc += game.gols_time1;

        if (game.gols_time1 > game.gols_time2) {
          homeTeam.v++;
          homeTeam.pts += 3;
          awayTeam.d++;
        } else if (game.gols_time1 < game.gols_time2) {
          awayTeam.v++;
          awayTeam.pts += 3;
          homeTeam.d++;
        } else {
          homeTeam.e++;
          awayTeam.e++;
          homeTeam.pts += 1;
          awayTeam.pts += 1;
        }
      }
    });

    standings.forEach(s => {
      s.sg = s.gp - s.gc;
    });

    // Sort by points, then wins, then goal difference
    return standings.sort((a, b) => {
      if (b.pts !== a.pts) return b.pts - a.pts;
      if (b.v !== a.v) return b.v - a.v;
      return b.sg - a.sg;
    });
  }
}

module.exports = new StandingsService();
