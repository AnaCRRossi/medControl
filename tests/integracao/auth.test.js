const request = require('supertest');
const app = require('../../src/app');
const { createAdmin, createRegularUser } = require('../helpers/createUser');
const generateToken = require('../helpers/generateToken');

describe('Autenticacao e autorizacao', () => {
  let adminToken;
  let userToken;
  let adminUser;
  let regularUser;

  beforeEach(async () => {
    // Create users via service
    adminUser = await createAdmin();
    regularUser = await createRegularUser();

    // Generate tokens
    adminToken = generateToken(adminUser.id, adminUser.role);
    userToken = generateToken(regularUser.id, regularUser.role);
  });

  it('retorna 401 para requisicoes sem token', async () => {
    const response = await request(app).get('/api/medicamentos');

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it('retorna 403 quando USER tenta criar medicamento', async () => {
    const response = await request(app)
      .post('/api/medicamentos')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        nome: 'Medicamento Restrito',
        intervaloMinimoHoras: 6,
        doseMaximaDiaria: 2000,
        unidade: 'mg',
      });

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('retorna 403 quando USER tenta deletar medicamento', async () => {
    const response = await request(app)
      .delete(`/api/medicamentos/${database.medicamentos[2].id}`)
      .set('Authorization', `Bearer ${userToken}`);

    expect(response.status).toBe(403);
    expect(response.body.success).toBe(false);
  });

  it('permite ADMIN acessar rotas protegidas', async () => {
    const pacientes = await request(app)
      .get('/api/pacientes')
      .set('Authorization', `Bearer ${adminToken}`);

    const medicamentos = await request(app)
      .get('/api/medicamentos')
      .set('Authorization', `Bearer ${adminToken}`);

    const prescricoes = await request(app)
      .get('/api/prescricoes')
      .set('Authorization', `Bearer ${adminToken}`);

    const registros = await request(app)
      .get('/api/registros-uso')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(pacientes.status).toBe(200);
    expect(medicamentos.status).toBe(200);
    expect(prescricoes.status).toBe(200);
    expect(registros.status).toBe(200);
  });

  it('retorna 404 para recurso inexistente', async () => {
    const response = await request(app)
      .get('/api/medicamentos/id-inexistente')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});
