const express = require('express');
const MedicamentoController = require('../controllers/MedicamentoController');
const authenticateToken = require('../middlewares/auth');
const authorize = require('../middlewares/authorization');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Medicamentos
 *   description: Gerenciamento de medicamentos
 */

/**
 * @swagger
 * /api/medicamentos:
 *   get:
 *     summary: Lista medicamentos
 *     tags: [Medicamentos]
 *     responses:
 *       200:
 *         description: Lista de medicamentos
 *   post:
 *     summary: Cria um medicamento
 *     tags: [Medicamentos]
 *     responses:
 *       201:
 *         description: Medicamento criado com sucesso
 */
router.get('/', authenticateToken, (req, res) =>
  MedicamentoController.getAll(req, res)
);

router.post('/', authenticateToken, authorize('ADMIN'), (req, res) =>
  MedicamentoController.create(req, res)
);

router.get('/:id', authenticateToken, (req, res) =>
  MedicamentoController.getById(req, res)
);

router.put('/:id', authenticateToken, authorize('ADMIN'), (req, res) =>
  MedicamentoController.update(req, res)
);

/**
 * @swagger
 * /api/medicamentos/{id}:
 *   delete:
 *     summary: Remove um medicamento com soft delete
 *     tags: [Medicamentos]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Medicamento deletado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Sucesso
 *               data:
 *                 mensagem: Medicamento deletado com sucesso
 *                 deletedAt: "2026-04-26T12:00:00.000Z"
 *       409:
 *         description: Medicamento possui prescricao ativa
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Nao e possivel deletar medicamento com prescricao ativa
 *               error: ConflictError
 */
router.delete('/:id', authenticateToken, authorize('ADMIN'), (req, res) =>
  MedicamentoController.delete(req, res)
);

module.exports = router;
