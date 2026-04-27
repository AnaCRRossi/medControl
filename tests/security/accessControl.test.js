process.env.JWT_SECRET = 'your-secret-key-change-in-production';
process.env.JWT_EXPIRATION = '1h';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../../src/app');
const Database = require('../../src/models/database');
const AuthService = require('../../src/services/auth.service');
const { v4: uuidv4 } = require('uuid');

describe('Access Control Tests', () => {
  let user1Token, user2Token, adminToken;
  let user1Id, user2Id, prescricaoUser1Id, prescricaoUser2Id;

  beforeAll(async () => {
    // Adicionar user1
    const hashedPassword1 = await AuthService.hashPassword('user1123');
    user1Id = uuidv4();
    Database.users.push({
      id: user1Id,
      email: 'user1@test.com',
      senha: hashedPassword1,
      role: 'USER',
      nome: 'User 1',
      dataCriacao: new Date(),
      deleted: false,
      deletedAt: null,
    });

    user1Token = jwt.sign({ id: user1Id, role: 'USER' }, process.env.JWT_SECRET);

    // Adicionar user2
    const hashedPassword2 = await AuthService.hashPassword('user2123');
    user2Id = uuidv4();
    Database.users.push({
      id: user2Id,
      email: 'user2@test.com',
      senha: hashedPassword2,
      role: 'USER',
      nome: 'User 2',
      dataCriacao: new Date(),
      deleted: false,
      deletedAt: null,
    });

    user2Token = jwt.sign({ id: user2Id, role: 'USER' }, process.env.JWT_SECRET);

    // Admin
    const admin = Database.users.find(u => u.role === 'ADMIN');
    adminToken = jwt.sign({ id: admin.id, role: 'ADMIN' }, process.env.JWT_SECRET);

    // Criar prescricao para user1
    const createRes1 = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({
        medicamentoId: Database.medicamentos[0].id,
        dosagem: 500,
        frequencia: '4h',
        dataInicio: new Date().toISOString(),
        dataFim: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        instrucoes: 'Tomar com água'
      });

    prescricaoUser1Id = createRes1.body.data.id;

    // Criar prescricao para user2
    const createRes2 = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${user2Token}`)
      .send({
        medicamentoId: Database.medicamentos[0].id,
        dosagem: 600,
        frequencia: '6h',
        dataInicio: new Date().toISOString(),
        dataFim: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        instrucoes: 'Após refeições'
      });

    prescricaoUser2Id = createRes2.body.data.id;
  });

  it('USER should not access another user\'s prescricao', async () => {
    const res = await request(app)
      .get(`/api/prescricoes/${prescricaoUser2Id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(403);
    expect(res.body.message).toBe('Você não tem permissão para acessar esta prescrição');
  });

  it('USER should access their own prescricao', async () => {
    const res = await request(app)
      .get(`/api/prescricoes/${prescricaoUser1Id}`)
      .set('Authorization', `Bearer ${user1Token}`);

    expect(res.status).toBe(200);
  });

  it('ADMIN should access any user\'s prescricao', async () => {
    const res = await request(app)
      .get(`/api/prescricoes/${prescricaoUser1Id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
  });
});