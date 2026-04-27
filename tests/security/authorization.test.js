process.env.JWT_SECRET = 'your-secret-key-change-in-production';
process.env.JWT_EXPIRATION = '1h';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const Database = require('../../src/models/database');
const AuthService = require('../../src/services/auth.service');
const { v4: uuidv4 } = require('uuid');

describe('Authorization Tests', () => {
  let userToken, adminToken;

  beforeAll(async () => {
    // Adicionar user de teste
    const hashedPassword = await AuthService.hashPassword('user123');
    const userId = uuidv4();
    Database.users.push({
      id: userId,
      email: 'user@test.com',
      senha: hashedPassword,
      role: 'USER',
      nome: 'Test User',
      dataCriacao: new Date(),
      deleted: false,
      deletedAt: null,
    });

    userToken = jwt.sign({ id: userId, role: 'USER' }, process.env.JWT_SECRET);

    // Admin já existe
    const admin = Database.users.find(u => u.role === 'ADMIN');
    adminToken = jwt.sign({ id: admin.id, role: 'ADMIN' }, process.env.JWT_SECRET);
  });

  it('USER trying to create medicamento should return 403', async () => {
    const res = await request(app)
      .post('/api/medicamentos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        nome: 'Test Medicamento',
        descricao: 'Descrição teste',
        intervaloMinimoHoras: 4,
        doseMáximaDiaria: 100,
        unidade: 'mg'
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Acesso negado: permissão insuficiente');
  });

  it('USER trying to delete medicamento should return 403', async () => {
    // Assumir um id existente, ou criar um
    const med = Database.medicamentos[0]; // Paracetamol
    const res = await request(app)
      .delete(`/api/medicamentos/${med.id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });

  it('USER trying to edit medicamento should return 403', async () => {
    const med = Database.medicamentos[0];
    const res = await request(app)
      .put(`/api/medicamentos/${med.id}`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ nome: 'Edited' });

    expect(res.status).toBe(403);
  });

  it('ADMIN should be able to create medicamento', async () => {
    const res = await request(app)
      .post('/api/medicamentos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Admin Medicamento',
        descricao: 'Criado por admin',
        intervaloMinimoHoras: 6,
        doseMáximaDiaria: 200,
        unidade: 'mg'
      });

    expect(res.status).toBe(201);
  });

  it('ADMIN should be able to delete medicamento', async () => {
    // Criar um para deletar
    const createRes = await request(app)
      .post('/api/medicamentos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'To Delete',
        descricao: 'To be deleted',
        intervaloMinimoHoras: 8,
        doseMáximaDiaria: 300,
        unidade: 'mg'
      });

    const medId = createRes.body.data.id;

    const res = await request(app)
      .delete(`/api/medicamentos/${medId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});