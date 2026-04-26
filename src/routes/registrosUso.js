const express = require('express');
const RegistroUsoController = require('../controllers/RegistroUsoController');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Registros de Uso
 *   description: Controle de uso dos medicamentos prescritos
 */

/**
 * @swagger
 * /api/registros-uso:
 *   get:
 *     summary: Lista registros de uso
 *     tags: [Registros de Uso]
 *     responses:
 *       200:
 *         description: Lista de registros de uso
 *   post:
 *     summary: Cria um registro de uso
 *     tags: [Registros de Uso]
 *     responses:
 *       201:
 *         description: Registro de uso criado com sucesso
 */
router.post('/', authMiddleware, (req, res) =>
  RegistroUsoController.create(req, res)
);

router.get('/', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  RegistroUsoController.getAll(req, res)
);

router.get('/prescricao/:prescricaoId', authMiddleware, (req, res) =>
  RegistroUsoController.getByPrescricao(req, res)
);

router.get('/usuario/:usuarioId', authMiddleware, (req, res) =>
  RegistroUsoController.getByUsuario(req, res)
);

router.get('/:id', authMiddleware, (req, res) =>
  RegistroUsoController.getById(req, res)
);

/**
 * @swagger
 * /api/registros-uso/{id}:
 *   delete:
 *     summary: Remove um registro de uso com soft delete
 *     tags: [Registros de Uso]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro de uso deletado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Sucesso
 *               data:
 *                 mensagem: Registro de uso deletado com sucesso
 *                 deletedAt: "2026-04-26T12:00:00.000Z"
 *       404:
 *         description: Registro de uso nao encontrado
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Registro de uso nao encontrado
 *               error: NotFoundError
 */
module.exports = router;
