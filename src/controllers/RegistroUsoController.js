const RegistroUsoService = require('../services/RegistroUsoService');
const { sendSuccess, sendError } = require('./response');

class RegistroUsoController {
  async create(req, res, next) {
    try {
      const registro = RegistroUsoService.create(req.body, req.user.id, req.user.type);
      sendSuccess(res, registro, 201, 'Registro de uso criado com sucesso');
    } catch (error) {
      sendError(res, error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const registro = RegistroUsoService.findById(id);
      sendSuccess(res, registro);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getByPrescricao(req, res, next) {
    try {
      const { prescricaoId } = req.params;
      const registros = RegistroUsoService.findByPrescricao(prescricaoId);
      sendSuccess(res, registros);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getByUsuario(req, res, next) {
    try {
      const { usuarioId } = req.params;

      // USER só pode ver seus próprios registros
      if (req.user.type !== 'ADMIN' && usuarioId !== req.user.id) {
        return sendError(
          res,
          {
            message: 'Você não tem permissão para acessar registros de outro usuário',
            statusCode: 403,
          },
          403
        );
      }

      const registros = RegistroUsoService.findByUsuario(usuarioId, req.user.type);
      sendSuccess(res, registros);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getAll(req, res, next) {
    try {
      const registros = RegistroUsoService.findAll();
      sendSuccess(res, registros);
    } catch (error) {
      sendError(res, error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = RegistroUsoService.delete(id);
      sendSuccess(res, resultado, 200);
    } catch (error) {
      sendError(res, error);
    }
  }
}

module.exports = new RegistroUsoController();
