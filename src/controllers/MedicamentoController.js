const MedicamentoService = require('../services/MedicamentoService');
const { sendSuccess, sendError } = require('./response');

class MedicamentoController {
  async create(req, res, next) {
    try {
      const medicamento = MedicamentoService.create(req.body);
      sendSuccess(res, medicamento, 201, 'Medicamento criado com sucesso');
    } catch (error) {
      sendError(res, error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const medicamento = MedicamentoService.findById(id);
      sendSuccess(res, medicamento);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getAll(req, res, next) {
    try {
      const medicamentos = MedicamentoService.findAll();
      sendSuccess(res, medicamentos);
    } catch (error) {
      sendError(res, error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const medicamento = MedicamentoService.update(id, req.body);
      sendSuccess(res, medicamento, 200, 'Medicamento atualizado com sucesso');
    } catch (error) {
      sendError(res, error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = MedicamentoService.delete(id);
      sendSuccess(res, resultado, 200);
    } catch (error) {
      sendError(res, error);
    }
  }
}

module.exports = new MedicamentoController();
