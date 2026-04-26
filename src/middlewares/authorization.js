function authorize(...allowedTypes) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não autenticado',
      });
    }

    if (!allowedTypes.includes(req.user.type)) {
      return res.status(403).json({
        success: false,
        message: 'Você não tem permissão para acessar este recurso',
      });
    }

    next();
  };
}

module.exports = authorize;
