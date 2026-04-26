const express = require('express');
const MedicamentoController = require('../controllers/MedicamentoController');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

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
router.get('/', authMiddleware, (req, res) =>
  MedicamentoController.getAll(req, res)
);

router.post('/', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  MedicamentoController.create(req, res)
);

router.get('/:id', authMiddleware, (req, res) =>
  MedicamentoController.getById(req, res)
);

router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
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
 *       400:
 *         description: Medicamento possui prescricao ativa
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Nao e possivel deletar medicamento com prescricao ativa
 *               error: ValidationError
 */
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  MedicamentoController.delete(req, res)
);

module.exports = router;
