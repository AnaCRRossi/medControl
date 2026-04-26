const express = require('express');
const UserController = require('../controllers/UserController');
const authenticateToken = require('../middlewares/auth');
const authorize = require('../middlewares/authorization');

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
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 */
router.post('/register', (req, res) => UserController.register(req, res));

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Realiza login
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 */
router.post('/login', (req, res) => UserController.login(req, res));

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Retorna o perfil do usuário autenticado
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Perfil retornado com sucesso
 */
router.get('/profile', authenticateToken, (req, res) => UserController.getProfile(req, res));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista usuários
 *     tags: [Usuários]
 *     responses:
 *       200:
 *         description: Lista de usuários
 */
router.get('/', authenticateToken, authorize('ADMIN'), (req, res) =>
  UserController.getAll(req, res)
);

router.put('/:id', authenticateToken, authorize('ADMIN'), (req, res) =>
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
 *       409:
 *         description: Paciente possui historico de uso
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: Nao e possivel deletar paciente com historico de uso
 *               error: ConflictError
 */
router.delete('/:id', authenticateToken, authorize('ADMIN'), (req, res) =>
  UserController.delete(req, res)
);

module.exports = router;
