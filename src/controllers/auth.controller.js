const AuthService = require('../services/auth.service');
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

      return sendResponse(res, 200, 'Login realizado com sucesso', { token });
    } catch (error) {
      console.error('Erro no login:', error);
      return sendResponse(res, 500, 'Erro interno do servidor');
    }
  }
}

module.exports = new AuthController();