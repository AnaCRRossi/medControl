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
 *     summary: Lista todos os medicamentos
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de medicamentos retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Medicamentos retornados com sucesso"
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   nome: "Paracetamol"
 *                   descricao: "Analgésico e antipirético"
 *                   intervaloMinimoHoras: 4
 *                   doseMáximaDiaria: 4000
 *                   unidade: "mg"
 *                   dataCriacao: "2026-04-25T10:30:00Z"
 *                 - id: "456e7890-e89b-12d3-a456-426614174001"
 *                   nome: "Ibuprofeno"
 *                   descricao: "Anti-inflamatório não esteroide"
 *                   intervaloMinimoHoras: 6
 *                   doseMáximaDiaria: 2400
 *                   unidade: "mg"
 *                   dataCriacao: "2026-04-25T11:00:00Z"
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Cria um novo medicamento (ADMIN)
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MedicamentoRequest'
 *           example:
 *             nome: "Dipirona"
 *             descricao: "Analgésico e antipirético"
 *             intervaloMinimoHoras: 6
 *             doseMáximaDiaria: 3000
 *             unidade: "mg"
 *     responses:
 *       201:
 *         description: Medicamento criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Medicamento criado com sucesso"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 nome: "Dipirona"
 *                 descricao: "Analgésico e antipirético"
 *                 intervaloMinimoHoras: 6
 *                 doseMáximaDiaria: 3000
 *                 unidade: "mg"
 *                 dataCriacao: "2026-04-25T10:30:00Z"
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       409:
 *         description: Medicamento já existe
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', authMiddleware, (req, res) =>
  MedicamentoController.getAll(req, res)
);

router.post('/', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  MedicamentoController.create(req, res)
);

/**
 * @swagger
 * /api/medicamentos/{id}:
 *   get:
 *     summary: Retorna um medicamento específico
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Medicamento retornado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Medicamento retornado com sucesso"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 nome: "Paracetamol"
 *                 descricao: "Analgésico e antipirético"
 *                 intervaloMinimoHoras: 4
 *                 doseMáximaDiaria: 4000
 *                 unidade: "mg"
 *                 dataCriacao: "2026-04-25T10:30:00Z"
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Medicamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Atualiza um medicamento (ADMIN)
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nome:
 *                 type: string
 *                 example: "Paracetamol Atualizado"
 *               descricao:
 *                 type: string
 *                 example: "Analgésico e antipirético atualizado"
 *               intervaloMinimoHoras:
 *                 type: number
 *                 example: 4
 *               doseMáximaDiaria:
 *                 type: number
 *                 example: 4000
 *               unidade:
 *                 type: string
 *                 example: "mg"
 *     responses:
 *       200:
 *         description: Medicamento atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Dados inválidos
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Medicamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Remove um medicamento (ADMIN)
 *     tags: [Medicamentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do medicamento
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Medicamento removido com sucesso
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
 *         description: Medicamento não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authMiddleware, (req, res) =>
  MedicamentoController.getById(req, res)
);

router.put('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  MedicamentoController.update(req, res)
);

router.delete('/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  MedicamentoController.delete(req, res)
);

module.exports = router;
