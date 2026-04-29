const { verifyToken } = require('../services/authService');
const { UnauthorizedError } = require('../models/errors');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedError('Token não fornecido');
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      throw new UnauthorizedError('Token inválido ou expirado');
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    req.user = {
      id: decoded.userId,
      type: decoded.userType,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(error.statusCode || 401).json({
      success: false,
      message: error.message,
    });
  }
}

module.exports = authenticateToken;
