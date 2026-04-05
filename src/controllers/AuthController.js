const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Empresa, Time } = require('../models');
const { loginSchema } = require('../validators/AuthValidator');

class AuthController {
  async login(req, res) {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { login, senha } = validatedData;
      
      // Try Empresa Login
      const empresa = await Empresa.findOne({ where: { login } });
      if (empresa) {
        if (!empresa.ativo) return res.status(403).json({ error: 'Conta desativada' });
        const validPass = await bcrypt.compare(senha, empresa.senha);
        if (!validPass) return res.status(400).json({ error: 'Senha inválida' });

        const token = jwt.sign(
          { id: empresa.id, isMaster: empresa.isMaster, type: 'company' },
          process.env.JWT_SECRET || 'secret'
        );
        return res.json({ token, user: { id: empresa.id, nome: empresa.nome, isMaster: empresa.isMaster, type: 'company' } });
      }

      // Try Coach Login
      const team = await Time.findOne({ where: { tecnico_login: login } });
      if (team) {
        if (senha !== team.tecnico_senha) return res.status(400).json({ error: 'Senha inválida' });
        
        const token = jwt.sign(
          { id: team.id, type: 'coach' },
          process.env.JWT_SECRET || 'secret'
        );
        return res.json({ token, user: { id: team.id, nome: `Treinador: ${team.nome}`, type: 'coach' } });
      }

      return res.status(400).json({ error: 'Usuário não encontrado' });
    } catch (err) {
      console.error('Login Error:', err);
      if (err.errors) {
        return res.status(400).json({ error: err.errors[0].message });
      }
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = new AuthController();
