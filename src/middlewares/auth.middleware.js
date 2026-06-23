const { PrismaClient } = require('@prisma/client');
const AuthService = require('../services/auth.service');
const { sendResponse } = require('../controllers/response');
const Database = require('../models/database');

const prisma = new PrismaClient();

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendResponse(res, 401, 'Token de autenticação necessário');
    }

    const token = authHeader.substring(7);
    const decoded = AuthService.verifyToken(token);

    if (!decoded) {
      return sendResponse(res, 401, 'Token inválido');
    }

    const decodedUserId = decoded.userId || decoded.id;

    let user = await prisma.user.findUnique({
      where: { id: decodedUserId },
    });

    if (!user) {
      const memoryUser = Database.users.find(
        item => item.id === decodedUserId && !item.deleted && !item.deletedAt
      );

      if (memoryUser) {
        user = {
          id: memoryUser.id,
          email: memoryUser.email,
          role: memoryUser.role,
          name: memoryUser.nome,
          age: memoryUser.idade,
        };
      }
    }

    if (!user && decodedUserId && decoded.role) {
      user = {
        id: decodedUserId,
        role: decoded.role,
        email: decoded.email,
      };
    }

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
