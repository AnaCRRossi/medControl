const request = require('supertest');
const app = require('../../src/app');
const database = require('../../src/database/database');
const { generateToken } = require('../../src/utils/auth');
const UserService = require('../../src/services/UserService');

describe('Prescricoes API Integration Tests', () => {
  let adminToken;
  let userToken;
  let userId;
  let medicamentoId;

  beforeEach(() => {
    database.reset();
    const admin = database.users.find(u => u.tipo === 'ADMIN');
    adminToken = generateToken(admin.id, admin.tipo);

    // Criar usuário comum e obter token
    const user = UserService.create('user@teste.com', 'senha123', 'Test User');
    userId = user.id;
    userToken = generateToken(user.id, 'USER');

    medicamentoId = database.medicamentos[0].id;
  });

  describe('POST /api/prescricoes', () => {
    it('should create prescription as user', async () => {
      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post('/api/prescricoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicamentoId,
          dosagem: 500,
          frequencia: '8h',
          dataInicio: today,
          dataFim: nextMonth,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.dosagem).toBe(500);
    });

    it('should not allow invalid frequency', async () => {
      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post('/api/prescricoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicamentoId,
          dosagem: 500,
          frequencia: '2h', // Menor que intervalo mínimo (4h)
          dataInicio: today,
          dataFim: nextMonth,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it('should validate prescription period', async () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      const response = await request(app)
        .post('/api/prescricoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicamentoId,
          dosagem: 500,
          frequencia: '8h',
          dataInicio: today,
          dataFim: yesterday,
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/prescricoes/usuario/:usuarioId', () => {
    it('should get prescriptions for user', async () => {
      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Create a prescription
      await request(app)
        .post('/api/prescricoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicamentoId,
          dosagem: 500,
          frequencia: '8h',
          dataInicio: today,
          dataFim: nextMonth,
        });

      const response = await request(app)
        .get(`/api/prescricoes/usuario/${userId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(1);
    });

    it('should not allow user to see other user prescriptions', async () => {
      const user2 = UserService.create('user2@teste.com', 'senha123', 'User 2');
      const user2Token = generateToken(user2.id, 'USER');

      const response = await request(app)
        .get(`/api/prescricoes/usuario/${userId}`)
        .set('Authorization', `Bearer ${user2Token}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/prescricoes', () => {
    it('should get all prescriptions as admin', async () => {
      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      await request(app)
        .post('/api/prescricoes')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          medicamentoId,
          dosagem: 500,
          frequencia: '8h',
          dataInicio: today,
          dataFim: nextMonth,
        });

      const response = await request(app)
        .get('/api/prescricoes')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});
