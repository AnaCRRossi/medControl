const express = require('express');
const AuthController = require('../controllers/auth.controller');

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Autenticação
 *   description: Endpoints de autenticação
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login e retorna token JWT
 *     tags: [Autenticação]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "admin@medcontrol.com"
 *             senha: "admin123"
 *     responses:
 *       200:
 *         description: Login realizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *             example:
 *               success: true
 *               message: "Login realizado com sucesso"
 *               data:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 usuario:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   email: "admin@medcontrol.com"
 *                   nome: "Admin User"
 *                   tipo: "ADMIN"
 *                   dataCriacao: "2026-04-25T10:30:00Z"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Email e senha são obrigatórios"
 *               error: "VALIDATION_ERROR"
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Email ou senha incorretos"
 *               error: "AUTHENTICATION_ERROR"
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Usuário não encontrado"
 *               error: "NOT_FOUND"
 */
router.post('/login', AuthController.login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Registra um novo usuário (ADMIN)
 *     tags: [Autenticação]
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
 *         description: Usuário registrado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Usuário registrado com sucesso"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 email: "novo@usuario.com"
 *                 nome: "João Silva"
 *                 tipo: "USER"
 *                 dataCriacao: "2026-04-25T10:30:00Z"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Email já registrado"
 *               error: "VALIDATION_ERROR"
 *       403:
 *         description: Acesso negado - apenas ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Acesso negado"
 *               error: "FORBIDDEN"
 *       409:
 *         description: Email já registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Email já registrado"
 *               error: "CONFLICT"
 */
router.post('/register', AuthController.register);

module.exports = router;