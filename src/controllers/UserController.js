const UserService = require('../services/UserService');
const { sendSuccess, sendError } = require('./response');

class UserController {
  async register(req, res, next) {
    try {
      const { email, senha, nome, role, idade } = req.body;
      const usuario = await UserService.create(email, senha, nome, role, idade);
      sendSuccess(res, usuario, 201, 'Usuário criado com sucesso');
    } catch (error) {
      sendError(res, error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const usuario = UserService.findById(req.user.id);
      sendSuccess(res, usuario);
    } catch (error) {
      sendError(res, error);
    }
  }

  async getAll(req, res, next) {
    try {
      const usuarios = UserService.findAll();
      sendSuccess(res, usuarios);
    } catch (error) {
      sendError(res, error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const usuario = UserService.update(id, req.body);
      sendSuccess(res, usuario, 200, 'Usuário atualizado com sucesso');
    } catch (error) {
      sendError(res, error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const resultado = UserService.delete(id);
      sendSuccess(res, resultado, 200);
    } catch (error) {
      sendError(res, error);
    }
  }
}

module.exports = new UserController();
