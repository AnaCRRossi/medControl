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
 *     summary: Lista todas as prescrições (ADMIN)
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de prescrições retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Prescrições retornadas com sucesso"
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   usuarioId: "456e7890-e89b-12d3-a456-426614174001"
 *                   medicamentoId: "789e0123-e89b-12d3-a456-426614174002"
 *                   dosagem: 500
 *                   unidade: "mg"
 *                   frequencia: "8h"
 *                   dataInicio: "2026-04-25T00:00:00Z"
 *                   dataFim: "2026-05-25T00:00:00Z"
 *                   notasAdicionais: "Tomar após as refeições"
 *                   dataCriacao: "2026-04-25T10:30:00Z"
 *                   medicamento:
 *                     id: "789e0123-e89b-12d3-a456-426614174002"
 *                     nome: "Paracetamol"
 *                     descricao: "Analgésico e antipirético"
 *                     intervaloMinimoHoras: 4
 *                     doseMáximaDiaria: 4000
 *                     unidade: "mg"
 *                   alertas:
 *                     - tipo: "INTERACAO_MEDICAMENTOSA"
 *                       mensagem: "Este medicamento possui interações"
 *                       detalhes:
 *                         - medicamentos: ["Paracetamol", "Ibuprofeno"]
 *                           nivelRisco: "HIGH"
 *                           descricao: "Risco de toxicidade hepática aumentada"
 *       403:
 *         description: Acesso negado - apenas ADMIN
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   post:
 *     summary: Cria uma nova prescrição
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PrescricaoRequest'
 *           example:
 *             medicamentoId: "123e4567-e89b-12d3-a456-426614174000"
 *             dosagem: 500
 *             frequencia: "8h"
 *             dataInicio: "2026-04-25T00:00:00Z"
 *             dataFim: "2026-05-25T00:00:00Z"
 *             notasAdicionais: "Tomar após as refeições"
 *     responses:
 *       201:
 *         description: Prescrição criada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Prescrição criada com sucesso"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 usuarioId: "456e7890-e89b-12d3-a456-426614174001"
 *                 medicamentoId: "789e0123-e89b-12d3-a456-426614174002"
 *                 dosagem: 500
 *                 unidade: "mg"
 *                 frequencia: "8h"
 *                 dataInicio: "2026-04-25T00:00:00Z"
 *                 dataFim: "2026-05-25T00:00:00Z"
 *                 notasAdicionais: "Tomar após as refeições"
 *                 dataCriacao: "2026-04-25T10:30:00Z"
 *                 medicamento:
 *                   id: "789e0123-e89b-12d3-a456-426614174002"
 *                   nome: "Paracetamol"
 *                   descricao: "Analgésico e antipirético"
 *                   intervaloMinimoHoras: 4
 *                   doseMáximaDiaria: 4000
 *                   unidade: "mg"
 *                 alertas:
 *                   - tipo: "INTERACAO_MEDICAMENTOSA"
 *                     mensagem: "Este medicamento possui interações"
 *                     detalhes:
 *                       - medicamentos: ["Paracetamol", "Ibuprofeno"]
 *                         nivelRisco: "HIGH"
 *                         descricao: "Risco de toxicidade hepática aumentada"
 *       400:
 *         description: Dados inválidos ou regras de negócio violadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Intervalo entre doses insuficiente"
 *               error: "VALIDATION_ERROR"
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
 */
router.post('/', authMiddleware, (req, res) =>
  PrescricaoController.create(req, res)
);

router.get('/', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  PrescricaoController.getAll(req, res)
);

/**
 * @swagger
 * /api/prescricoes/usuario/{usuarioId}:
 *   get:
 *     summary: Lista prescrições de um usuário específico
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: usuarioId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do usuário
 *         example: "456e7890-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Prescrições do usuário retornadas com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas ADMIN ou próprio usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/usuario/:usuarioId', authMiddleware, (req, res) =>
  PrescricaoController.getByUsuario(req, res)
);

/**
 * @swagger
 * /api/prescricoes/{id}:
 *   get:
 *     summary: Retorna uma prescrição específica
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da prescrição
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Prescrição retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas ADMIN ou próprio usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Prescrição não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Atualiza uma prescrição
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da prescrição
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dosagem:
 *                 type: number
 *                 example: 750
 *               frequencia:
 *                 type: string
 *                 example: "6h"
 *               dataInicio:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-25T00:00:00Z"
 *               dataFim:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-05-25T00:00:00Z"
 *               notasAdicionais:
 *                 type: string
 *                 example: "Tomar após as refeições"
 *     responses:
 *       200:
 *         description: Prescrição atualizada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       400:
 *         description: Dados inválidos ou regras de negócio violadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas ADMIN ou próprio usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Prescrição não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Remove uma prescrição
 *     tags: [Prescrições]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da prescrição
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Prescrição removida com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Token não fornecido ou inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Acesso negado - apenas ADMIN ou próprio usuário
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Prescrição não encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authMiddleware, (req, res) =>
  PrescricaoController.getById(req, res)
);

router.put('/:id', authMiddleware, (req, res) =>
  PrescricaoController.update(req, res)
);

router.delete('/:id', authMiddleware, (req, res) =>
  PrescricaoController.delete(req, res)
);

module.exports = router;

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
