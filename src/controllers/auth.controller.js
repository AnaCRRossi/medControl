const AuthService = require('../services/auth.service');
const UserService = require('../services/UserService');
const Database = require('../models/database');
const { sendResponse } = require('./response');

class AuthController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return sendResponse(res, 400, 'Email e senha são obrigatórios');
      }

      const user = Database.users.find(u => u.email === email && !u.deleted);

      if (!user) {
        return sendResponse(res, 401, 'Credenciais inválidas');
      }

      const isPasswordValid = await AuthService.comparePassword(senha, user.senha);

      if (!isPasswordValid) {
        return sendResponse(res, 401, 'Credenciais inválidas');
      }

      const token = AuthService.generateToken(user);

      return sendResponse(res, 200, 'Login realizado com sucesso', { token, usuario: user });
    } catch (error) {
      console.error('Erro no login:', error);
      return sendResponse(res, 500, 'Erro interno do servidor');
    }
  }

  async register(req, res) {
    try {
      const { email, senha, nome, tipo } = req.body;

      if (!email || !senha || !nome) {
        return sendResponse(res, 400, 'Email, senha e nome são obrigatórios');
      }

      const usuario = await UserService.create(email, senha, nome, tipo || 'USER');
      return sendResponse(res, 201, 'Usuário registrado com sucesso', usuario);
    } catch (error) {
      console.error('Erro no registro:', error);
      if (error.message === 'Email já registrado') {
        return sendResponse(res, 409, error.message);
      }
      return sendResponse(res, 500, 'Erro interno do servidor');
    }
  }
}

module.exports = new AuthController();