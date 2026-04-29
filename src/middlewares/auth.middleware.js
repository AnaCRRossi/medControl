const AuthService = require('../services/auth.service');
const { PrismaClient } = require('@prisma/client');
const { sendResponse } = require('../controllers/response');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, 401, 'Token de autenticação necessário');
    }

    const token = authHeader.substring(7); // Remove 'Bearer '

    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return sendResponse(res, 401, 'Token inválido');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.deletedAt) {
      return sendResponse(res, 401, 'Usuário não encontrado');
    }

    req.user = user;
    next();
  } catch (error) {
    return sendResponse(res, 500, 'Erro interno do servidor');
  }
};

module.exports = authMiddleware;