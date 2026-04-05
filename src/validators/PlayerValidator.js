const { z } = require('zod');

const createPlayerSchema = z.object({
  nome: z.string().min(3, 'Nome do jogador deve ter pelo menos 3 caracteres'),
  cpf: z.string()
    .transform(val => val.replace(/\D/g, '')) // Remove tudo que não é número
    .refine(val => val.length === 11 || val.length === 0, 'CPF deve ter 11 dígitos')
    .optional()
    .or(z.literal('')),
  titulo_eleitor: z.string().optional().or(z.literal('')),
});

module.exports = { createPlayerSchema };
