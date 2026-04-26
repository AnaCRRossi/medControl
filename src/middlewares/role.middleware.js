const { sendResponse } = require('../controllers/response');

const roleMiddleware = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return sendResponse(res, 401, 'Usuário não autenticado');
    }

    if (!allowedRoles.includes(req.user.role)) {
      return sendResponse(res, 403, 'Acesso negado: permissão insuficiente');
    }

    next();
  };
};

module.exports = roleMiddleware;