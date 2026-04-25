const express = require('express');
const RegistroUsoController = require('../controllers/RegistroUsoController');
const authenticateToken = require('../middlewares/auth');
const authorize = require('../middlewares/authorization');

const router = express.Router();

// Criar registro de uso
router.post('/', authenticateToken, (req, res) =>
  RegistroUsoController.create(req, res)
);

// Visualizar todos (apenas ADMIN)
router.get('/', authenticateToken, authorize('ADMIN'), (req, res) =>
  RegistroUsoController.getAll(req, res)
);

router.get('/:id', authenticateToken, (req, res) =>
  RegistroUsoController.getById(req, res)
);

router.get('/prescricao/:prescricaoId', authenticateToken, (req, res) =>
  RegistroUsoController.getByPrescricao(req, res)
);

router.get('/usuario/:usuarioId', authenticateToken, (req, res) =>
  RegistroUsoController.getByUsuario(req, res)
);

router.delete('/:id', authenticateToken, (req, res) =>
  RegistroUsoController.delete(req, res)
);

module.exports = router;
