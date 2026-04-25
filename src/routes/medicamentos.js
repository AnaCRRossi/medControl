const express = require('express');
const MedicamentoController = require('../controllers/MedicamentoController');
const authenticateToken = require('../middlewares/auth');
const authorize = require('../middlewares/authorization');

const router = express.Router();

// Todos os usuários autenticados podem visualizar
router.get('/', authenticateToken, (req, res) =>
  MedicamentoController.getAll(req, res)
);

router.get('/:id', authenticateToken, (req, res) =>
  MedicamentoController.getById(req, res)
);

// Apenas ADMIN pode criar, atualizar e deletar
router.post('/', authenticateToken, authorize('ADMIN'), (req, res) =>
  MedicamentoController.create(req, res)
);

router.put('/:id', authenticateToken, authorize('ADMIN'), (req, res) =>
  MedicamentoController.update(req, res)
);

router.delete('/:id', authenticateToken, authorize('ADMIN'), (req, res) =>
  MedicamentoController.delete(req, res)
);

module.exports = router;
