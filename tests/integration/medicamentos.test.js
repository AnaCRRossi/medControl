const request = require('supertest');
const app = require('../../src/app');
const database = require('../../src/database/database');
const { generateToken } = require('../../src/utils/auth');

describe('Medicamentos API Integration Tests', () => {
  let adminToken;
  let userToken;

  beforeEach(() => {
    database.reset();
    const admin = database.users.find(u => u.tipo === 'ADMIN');
    adminToken = generateToken(admin.id, admin.tipo);
  });

  describe('GET /api/medicamentos', () => {
    it('should get all medicamentos when authenticated', async () => {
      const response = await request(app)
        .get('/api/medicamentos')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });

    it('should not get medicamentos without authentication', async () => {
      const response = await request(app).get('/api/medicamentos');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/medicamentos', () => {
    it('should create medicamento as admin', async () => {
      const response = await request(app)
        .post('/api/medicamentos')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          nome: 'Novo Medicamento',
          descricao: 'Descrição do medicamento',
          intervaloMinimoHoras: 6,
          doseMáximaDiaria: 3000,
          unidade: 'mg',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.nome).toBe('Novo Medicamento');
    });

    it('should not create medicamento without admin role', async () => {
      // Criar um usuário comum
      const userRes = await request(app)
        .post('/api/users/register')
        .send({
          email: 'user@teste.com',
          senha: 'senha123',
          nome: 'Test User',
        });

      const loginRes = await request(app)
        .post('/api/users/login')
        .send({
          email: 'user@teste.com',
          senha: 'senha123',
        });

      const userToken = loginRes.body.data.token;

      const response = await request(app)
        .post('/api/medicamentos')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          nome: 'Novo Medicamento',
          intervaloMinimoHoras: 6,
          doseMáximaDiaria: 3000,
          unidade: 'mg',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/medicamentos/:id', () => {
    it('should get medicamento by id', async () => {
      const medicamentos = database.medicamentos.filter(m => !m.deleted);
      const medicamento = medicamentos[0];

      const response = await request(app)
        .get(`/api/medicamentos/${medicamento.id}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(medicamento.id);
    });

    it('should return 404 for non-existent medicamento', async () => {
      const response = await request(app)
        .get('/api/medicamentos/id-inexistente')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});
