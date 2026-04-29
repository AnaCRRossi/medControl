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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           example:
 *             email: "novo@usuario.com"
 *             senha: "senha123"
 *             nome: "João Silva"
 *             tipo: "USER"
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Usuário criado com sucesso"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 email: "novo@usuario.com"
 *                 nome: "João Silva"
 *                 tipo: "USER"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Email já registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Perfil retornado com sucesso"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 email: "usuario@exemplo.com"
 *                 nome: "João Silva"
 *                 tipo: "USER"
 *                 dataCriacao: "2026-04-25T10:30:00Z"
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/profile', authMiddleware, (req, res) => UserController.getProfile(req, res));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lista todos os usuários (ADMIN)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuários retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Lista de usuários retornada com sucesso"
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   email: "admin@medcontrol.com"
 *                   nome: "Admin User"
 *                   tipo: "ADMIN"
 *                   dataCriacao: "2026-04-25T10:30:00Z"
 *                 - id: "456e7890-e89b-12d3-a456-426614174001"
 *                   email: "user@exemplo.com"
 *                   nome: "João Silva"
 *                   tipo: "USER"
 *                   dataCriacao: "2026-04-25T11:00:00Z"
 *       403:
 *         description: Acesso negado - apenas ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => UserController.getAll(req, res));

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Atualiza um usuário (ADMIN)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "novoemail@exemplo.com"
 *               nome:
 *                 type: string
 *                 example: "João Silva Atualizado"
 *               senha:
 *                 type: string
 *                 example: "novaSenha123"
 *     responses:
 *       200:
 *         description: Usuário atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Acesso negado - apenas ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => UserController.update(req, res));

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Remove um usuário (ADMIN)
 *     tags: [Usuários]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Usuário removido com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       403:
 *         description: Acesso negado - apenas ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) => UserController.delete(req, res));

module.exports = router;
