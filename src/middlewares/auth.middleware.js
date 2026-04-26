const AuthService = require('../services/auth.service');
const Database = require('../models/database');
const { sendResponse } = require('../controllers/response');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendResponse(res, 401, 'Token de autenticação necessário');
  }

  const token = authHeader.substring(7); // Remove 'Bearer '

  const decoded = AuthService.verifyToken(token);

  if (!decoded) {
    return sendResponse(res, 401, 'Token inválido');
  }

  const user = Database.users.find(u => u.id === decoded.id && !u.deleted);

  if (!user) {
    return sendResponse(res, 401, 'Usuário não encontrado');
  }

  req.user = user;
  next();
};

module.exports = authMiddleware;