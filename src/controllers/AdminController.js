const bcrypt = require('bcryptjs');
const { Empresa, Campeonato } = require('../models');

class AdminController {
  async listEmpresas(req, res) {
    try {
      if (!req.user.isMaster) return res.status(403).json({ error: 'Acesso negado' });
      const empresas = await Empresa.findAll({ where: { isMaster: false } });
      res.json(empresas);
    } catch (err) {
      console.error('listEmpresas Error:', err);
      res.status(500).json({ error: 'Erro ao listar empresas' });
    }
  }

  async listAllChampionships(req, res) {
    try {
      if (!req.user.isMaster) return res.status(403).json({ error: 'Acesso negado' });
      const championships = await Campeonato.findAll({
        include: [{ 
          model: Empresa, 
          attributes: ['nome'],
          required: false
        }]
      });
      res.json(championships);
    } catch (err) {
      console.error('listAllChampionships Error:', err);
      res.status(500).json({ error: 'Erro ao listar campeonatos' });
    }
  }

  async deleteChampionship(req, res) {
    try {
      if (!req.user.isMaster) return res.status(403).json({ error: 'Acesso negado' });
      const { id } = req.params;
      await Campeonato.destroy({ where: { id } });
      res.json({ message: 'Campeonato removido com sucesso' });
    } catch (err) {
      console.error('deleteChampionship Error:', err);
      res.status(500).json({ error: 'Erro ao excluir campeonato' });
    }
  }

  async createEmpresa(req, res) {
    try {
      if (!req.user.isMaster) return res.status(403).json({ error: 'Acesso negado' });
      const { nome, login, senha } = req.body;
      
      if (!nome || !login || !senha) return res.status(400).json({ error: 'Campos obrigatórios faltando' });

      const hashedPassword = await bcrypt.hash(senha, 10);
      const empresa = await Empresa.create({ nome, login, senha: hashedPassword });
      res.json(empresa);
    } catch (err) {
      console.error('createEmpresa Error:', err);
      res.status(500).json({ error: 'Erro ao criar empresa' });
    }
  }

  async toggleEmpresa(req, res) {
    try {
      if (!req.user.isMaster) return res.status(403).json({ error: 'Acesso negado' });
      const { id } = req.params;
      const empresa = await Empresa.findByPk(id);
      if (!empresa) return res.status(404).json({ error: 'Empresa não encontrada' });
      
      empresa.ativo = !empresa.ativo;
      await empresa.save();
      res.json(empresa);
    } catch (err) {
      console.error('toggleEmpresa Error:', err);
      res.status(500).json({ error: 'Erro ao alternar status da empresa' });
    }
  }

  async deleteEmpresa(req, res) {
    try {
      if (!req.user.isMaster) return res.status(403).json({ error: 'Acesso negado' });
      const { id } = req.params;
      await Empresa.destroy({ where: { id } });
      res.json({ message: 'Empresa removida com sucesso' });
    } catch (err) {
      console.error('deleteEmpresa Error:', err);
      res.status(500).json({ error: 'Erro ao excluir empresa' });
    }
  }
}

module.exports = new AdminController();
