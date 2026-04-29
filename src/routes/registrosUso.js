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
 *     summary: Lista todos os registros de uso (ADMIN)
 *     tags: [Registros de Uso]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de registros de uso retornada com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Registros de uso retornados com sucesso"
 *               data:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   prescricaoId: "456e7890-e89b-12d3-a456-426614174001"
 *                   dosagem: 500
 *                   dataHora: "2026-04-25T08:30:00Z"
 *                   notas: "Tomado com água"
 *                   dataCriacao: "2026-04-25T08:30:00Z"
 *                   prescricao:
 *                     id: "456e7890-e89b-12d3-a456-426614174001"
 *                     usuarioId: "789e0123-e89b-12d3-a456-426614174002"
 *                     medicamentoId: "012e3456-e89b-12d3-a456-426614174003"
 *                     dosagem: 500
 *                     unidade: "mg"
 *                     frequencia: "8h"
 *                     dataInicio: "2026-04-25T00:00:00Z"
 *                     dataFim: "2026-05-25T00:00:00Z"
 *                   alertas:
 *                     - tipo: "AVISO_DOSE_MAXIMA"
 *                       mensagem: "Atingidos 80% da dose máxima diária"
 *                       percentual: "80.0"
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
 *     summary: Registra o uso de um medicamento
 *     tags: [Registros de Uso]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegistroUsoRequest'
 *           example:
 *             prescricaoId: "123e4567-e89b-12d3-a456-426614174000"
 *             dosagem: 500
 *             dataHora: "2026-04-25T08:30:00Z"
 *             notas: "Tomado com água"
 *     responses:
 *       201:
 *         description: Registro de uso criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *             example:
 *               success: true
 *               message: "Registro de uso criado com sucesso"
 *               data:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 prescricaoId: "456e7890-e89b-12d3-a456-426614174001"
 *                 dosagem: 500
 *                 dataHora: "2026-04-25T08:30:00Z"
 *                 notas: "Tomado com água"
 *                 dataCriacao: "2026-04-25T08:30:00Z"
 *                 prescricao:
 *                   id: "456e7890-e89b-12d3-a456-426614174001"
 *                   usuarioId: "789e0123-e89b-12d3-a456-426614174002"
 *                   medicamentoId: "012e3456-e89b-12d3-a456-426614174003"
 *                   dosagem: 500
 *                   unidade: "mg"
 *                   frequencia: "8h"
 *                   dataInicio: "2026-04-25T00:00:00Z"
 *                   dataFim: "2026-05-25T00:00:00Z"
 *                 alertas:
 *                   - tipo: "AVISO_DOSE_MAXIMA"
 *                     mensagem: "Atingidos 80% da dose máxima diária"
 *                     percentual: "80.0"
 *       400:
 *         description: Dados inválidos ou regras de negócio violadas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *             example:
 *               success: false
 *               message: "Intervalo mínimo entre doses não respeitado"
 *               error: "VALIDATION_ERROR"
 *       401:
 *         description: Token não fornecido ou inválido
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
router.post('/', authMiddleware, (req, res) =>
  RegistroUsoController.create(req, res)
);

router.get('/', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  RegistroUsoController.getAll(req, res)
);

/**
 * @swagger
 * /api/registros-uso/prescricao/{prescricaoId}:
 *   get:
 *     summary: Lista registros de uso de uma prescrição específica
 *     tags: [Registros de Uso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: prescricaoId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID da prescrição
 *         example: "456e7890-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Registros de uso da prescrição retornados com sucesso
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
router.get('/prescricao/:prescricaoId', authMiddleware, (req, res) =>
  RegistroUsoController.getByPrescricao(req, res)
);

/**
 * @swagger
 * /api/registros-uso/usuario/{usuarioId}:
 *   get:
 *     summary: Lista registros de uso de um usuário específico
 *     tags: [Registros de Uso]
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
 *         example: "789e0123-e89b-12d3-a456-426614174002"
 *     responses:
 *       200:
 *         description: Registros de uso do usuário retornados com sucesso
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
  RegistroUsoController.getByUsuario(req, res)
);

/**
 * @swagger
 * /api/registros-uso/{id}:
 *   get:
 *     summary: Retorna um registro de uso específico
 *     tags: [Registros de Uso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do registro de uso
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Registro de uso retornado com sucesso
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
 *         description: Registro de uso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   put:
 *     summary: Atualiza um registro de uso
 *     tags: [Registros de Uso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do registro de uso
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
 *                 example: 500
 *               dataHora:
 *                 type: string
 *                 format: date-time
 *                 example: "2026-04-25T08:30:00Z"
 *               notas:
 *                 type: string
 *                 example: "Tomado com água"
 *     responses:
 *       200:
 *         description: Registro de uso atualizado com sucesso
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
 *         description: Registro de uso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *   delete:
 *     summary: Remove um registro de uso
 *     tags: [Registros de Uso]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID do registro de uso
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Registro de uso removido com sucesso
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
 *         description: Registro de uso não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/:id', authMiddleware, (req, res) =>
  RegistroUsoController.getById(req, res)
);

router.put('/:id', authMiddleware, (req, res) =>
  RegistroUsoController.update(req, res)
);

router.delete('/:id', authMiddleware, (req, res) =>
  RegistroUsoController.delete(req, res)
);

module.exports = router;

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
