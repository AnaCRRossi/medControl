const { sendError } = require('../controllers/response');
const { ApiError } = require('../models/errors');

function errorHandler(err, req, res, next) {
  console.error('Erro:', err);

  if (err instanceof ApiError) {
    return sendError(res, err, err.statusCode);
  }

  // Erro genérico
  const apiError = new ApiError(
    err.message || 'Erro interno do servidor',
    500
  );

  sendError(res, apiError, 500);
}

module.exports = errorHandler;
