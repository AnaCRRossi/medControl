const express = require('express');
const PrescricaoController = require('../controllers/PrescricaoController');
const authenticateToken = require('../middlewares/auth');
const authorize = require('../middlewares/authorization');

const router = express.Router();

// USER: criar e visualizar suas prescrições
// ADMIN: visualizar todas as prescrições
router.post('/', authenticateToken, (req, res) =>
  PrescricaoController.create(req, res)
);

router.get('/', authenticateToken, authorize('ADMIN'), (req, res) =>
  PrescricaoController.getAll(req, res)
);

router.get('/:id', authenticateToken, (req, res) =>
  PrescricaoController.getById(req, res)
);

router.get('/usuario/:usuarioId', authenticateToken, (req, res) =>
  PrescricaoController.getByUsuario(req, res)
);

router.put('/:id', authenticateToken, (req, res) =>
  PrescricaoController.update(req, res)
);

router.delete('/:id', authenticateToken, (req, res) =>
  PrescricaoController.delete(req, res)
);

module.exports = router;
