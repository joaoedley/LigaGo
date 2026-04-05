const { Campo, Empresa } = require('../models');

class CampoController {
  async listCampos(req, res) {
    try {
      const campos = await Campo.findAll({ where: { empresa_id: req.user.id } });
      res.json(campos);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async createCampo(req, res) {
    try {
      const { nome, localizacao } = req.body;
      if (!nome) return res.status(400).json({ error: 'Nome do campo é obrigatório' });
      
      const campo = await Campo.create({
        nome,
        localizacao,
        empresa_id: req.user.id
      });
      res.json(campo);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async deleteCampo(req, res) {
    try {
      const { id } = req.params;
      await Campo.destroy({ where: { id, empresa_id: req.user.id } });
      res.json({ message: 'Campo removido com sucesso' });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }
}

module.exports = new CampoController();
