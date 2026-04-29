const request = require('supertest');
const app = require('../../src/app');
const { PrismaClient } = require('@prisma/client');
const generateToken = require('../helpers/generateToken');
const { createAdmin } = require('../helpers/createUser');

const prisma = new PrismaClient();

describe('Paciente', () => {
  let adminToken;

  beforeEach(async () => {
    // Clear all data
    await prisma.usageRecord.deleteMany();
    await prisma.prescription.deleteMany();
    await prisma.patient.deleteMany();
    await prisma.medication.deleteMany();
    await prisma.user.deleteMany();

    // Create admin user using helper
    const adminUser = await createAdmin();
    adminToken = generateToken(adminUser.id, adminUser.role);
  });

  it('cria paciente com nome e retorna 201', async () => {
    const response = await request(app)
      .post('/api/pacientes')
      .send({
        nome: 'Paciente Teste',
        idade: 35,
        email: 'paciente@teste.com',
        senha: 'senha123',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.nome).toBe('Paciente Teste');
    expect(response.body.data.idade).toBe(35);
  });

  it('nao cria paciente sem nome e retorna 400', async () => {
    const response = await request(app)
      .post('/api/pacientes')
      .send({
        idade: 35,
        email: 'sem.nome@teste.com',
        senha: 'senha123',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('nao cria paciente com idade negativa e retorna 400', async () => {
    const response = await request(app)
      .post('/api/pacientes')
      .send({
        nome: 'Paciente Idade Invalida',
        idade: -1,
        email: 'idade.invalida@teste.com',
        senha: 'senha123',
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('busca pacientes e retorna 200', async () => {
    await request(app)
      .post('/api/pacientes')
      .send({
        nome: 'Paciente Listado',
        idade: 40,
        email: 'listado@teste.com',
        senha: 'senha123',
      });

    const response = await request(app)
      .get('/api/pacientes')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});
