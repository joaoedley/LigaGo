const { z } = require('zod');

const createTeamSchema = z.object({
  nome: z.string().min(3, 'Nome do time deve ter pelo menos 3 caracteres'),
  qtd_jogadores: z.coerce.number().int().nonnegative().default(0),
});

module.exports = { createTeamSchema };
