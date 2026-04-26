const express = require('express');
const PrescricaoController = require('../controllers/PrescricaoController');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Prescrições
 *   description: Gerenciamento de prescrições médicas
 */

/**
 * @swagger
 * /api/prescricoes:
 *   get:
 *     summary: Lista prescrições
 *     tags: [Prescrições]
 *     responses:
 *       200:
 *         description: Lista de prescrições
 *   post:
 *     summary: Cria uma prescrição
 *     tags: [Prescrições]
 *     responses:
 *       201:
 *         description: Prescrição criada com sucesso
 */
router.post('/', authMiddleware, (req, res) =>
  PrescricaoController.create(req, res)
);

router.get('/', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  PrescricaoController.getAll(req, res)
);

router.get('/usuario/:usuarioId', authMiddleware, (req, res) =>
  PrescricaoController.getByUsuario(req, res)
);

router.get('/:id', authMiddleware, (req, res) =>
  PrescricaoController.getById(req, res)
);

router.put('/:id', authMiddleware, (req, res) =>
  PrescricaoController.update(req, res)
);

/**
 * @swagger
 * /api/prescricoes/{id}:
 *   delete:
 *     summary: Remove uma prescricao com soft delete
 *     tags: [Prescrições]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Prescricao deletada com sucesso
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Sucesso
 *               data:
 *                 mensagem: Prescricao deletada com sucesso
 *                 deletedAt: "2026-04-26T12:00:00.000Z"
 *       400:
 *         description: Prescricao ativa nao pode ser deletada
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Nao e possivel deletar prescricao ativa
 *               error: ValidationError
 */
router.delete('/:id', authMiddleware, (req, res) =>
  PrescricaoController.delete(req, res)
);

module.exports = router;
