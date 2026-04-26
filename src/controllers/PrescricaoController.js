const PrescricaoService = require('../services/PrescricaoService');
const { sendSuccess, sendError } = require('./response');

class PrescricaoController {
  async create(req, res, next) {
    try {
      const prescricao = PrescricaoService.create(req.body, req.user.id);
      sendSuccess(res, prescricao, 201, 'Prescrição criada com sucesso');
    } catch (error) {
      sendError(res, error);
    }
  }

  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const prescricao = PrescricaoService.findById(id);

      // Verificar autorização
      if (req.user.type !== 'ADMIN' && prescricao.usuarioId !== req.user.id) {
        return sendError(
          res,
          {
            message: 'Você não tem permissão para acessar esta prescrição',
            statusCode: 403,
          },
          403
        );
      }

      sendSuccess(res, prescricao);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getByUsuario(req, res, next) {
    try {
      const { usuarioId } = req.params;

      // USER só pode ver seus próprios dados
      if (req.user.type !== 'ADMIN' && usuarioId !== req.user.id) {
        return sendError(
          res,
          {
            message: 'Você não tem permissão para acessar prescrições de outro usuário',
            statusCode: 403,
          },
          403
        );
      }

      const prescricoes = PrescricaoService.findByUsuario(usuarioId);
      sendSuccess(res, prescricoes);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getAll(req, res, next) {
    try {
      const prescricoes = PrescricaoService.findAll();
      sendSuccess(res, prescricoes);
    } catch (error) {
      sendError(res, error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const prescricao = PrescricaoService.update(id, req.body, req.user.id, req.user.type);
      sendSuccess(res, prescricao, 200, 'Prescrição atualizada com sucesso');
    } catch (error) {
      sendError(res, error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = PrescricaoService.delete(id, req.user.id, req.user.type);
      sendSuccess(res, resultado, 200);
    } catch (error) {
      sendError(res, error);
    }
  }
}

module.exports = new PrescricaoController();
