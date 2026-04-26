const express = require('express');
const UserController = require('../controllers/UserController');
const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Usuários
 *   description: Autenticação e gerenciamento de usuários
 */

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Registra um novo usuário
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
router.post('/register', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => UserController.register(req, res));

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 */
router.get('/profile', authMiddleware, (req, res) => UserController.getProfile(req, res));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista usuários
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  UserController.getAll(req, res)
);

router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  UserController.update(req, res)
);

/**
 * @swagger
 * /api/pacientes/{id}:
 *   delete:
 *     summary: Remove um paciente com soft delete
 *     tags: [Usuários]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Paciente deletado com sucesso
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: Sucesso
 *               data:
 *                 mensagem: Paciente deletado com sucesso
 *                 deletedAt: "2026-04-26T12:00:00.000Z"
 *       400:
 *         description: Paciente possui historico de uso
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Nao e possivel deletar paciente com historico de uso
 *               error: ValidationError
 */
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  UserController.delete(req, res)
);

module.exports = router;
