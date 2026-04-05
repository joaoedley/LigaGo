const { z } = require('zod');

const createChampionshipSchema = z.object({
  nome: z.string().min(3, 'Nome do campeonato deve ter pelo menos 3 caracteres'),
  max_times: z.coerce.number().int().nonnegative().default(0),
  max_jogos: z.coerce.number().int().nonnegative().default(0),
});

module.exports = { createChampionshipSchema };
