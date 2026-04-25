const { verifyToken } = require('../utils/auth');
const { UnauthorizedError } = require('../utils/errors');
const database = require('../database/database');

function authenticateToken(req, res, next) {
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

    // Verificar se o usuário ainda existe no banco de dados
    const user = database.users.find(u => u.id === decoded.userId && !u.deleted);
    if (!user) {
      throw new UnauthorizedError('Usuário não encontrado');
    }

    req.user = {
      id: decoded.userId,
      type: decoded.userType,
      email: user.email,
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
