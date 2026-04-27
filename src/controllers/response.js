function sendSuccess(res, data, statusCode = 200, message = 'Sucesso') {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function sendError(res, error, statusCode = 500) {
  const status = error.statusCode || statusCode;
  return res.status(status).json({
    success: false,
    message: error.message,
    error: error.name,
  });
}

function sendPaginated(res, items, total, page, limit, statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    data: items,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
  });
}

function sendResponse(res, statusCode, message, data = null) {
  return res.status(statusCode).json({
    success: statusCode < 400,
    message,
    data,
  });
}

module.exports = {
  sendSuccess,
  sendError,
  sendPaginated,
  sendResponse,
};
