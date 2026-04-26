const request = require('supertest');
const app = require('../../src/app');
const database = require('../../src/models/database');
const { generateToken } = require('../../src/services/authService');

describe('Medicacao', () => {
  let adminToken;
  let userToken;

  beforeEach(() => {
    database.reset();
    adminToken = generateToken(database.users[0].id, 'ADMIN');
    database.users.push({
      id: 'user-medicacao',
      email: 'user.medicacao@teste.com',
      senha: Buffer.from('senha123').toString('base64'),
      nome: 'Paciente Medicacao',
      tipo: 'USER',
      dataCriacao: new Date(),
      deleted: false,
      deletedAt: null,
    });
    userToken = generateToken('user-medicacao', 'USER');
  });

  it('deleta medicamento valido e retorna 200', async () => {
    const created = await request(app)
      .post('/api/medicamentos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Medicamento Delete',
        intervaloMinimoHoras: 6,
        doseMaximaDiaria: 2000,
        unidade: 'mg',
      });

    const response = await request(app)
      .delete(`/api/medicamentos/${created.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.deletedAt).toBeDefined();
  });

  it('nao lista medicamento deletado no GET', async () => {
    const created = await request(app)
      .post('/api/medicamentos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Medicamento Oculto',
        intervaloMinimoHoras: 6,
        doseMaximaDiaria: 2000,
        unidade: 'mg',
      });

    await request(app)
      .delete(`/api/medicamentos/${created.body.data.id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    const response = await request(app)
      .get('/api/medicamentos')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.find(item => item.id === created.body.data.id)).toBeUndefined();
  });

  it('nao deleta medicamento com prescricao ativa e retorna 400', async () => {
    await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${userToken}`)
      .send({
        medicamentoId: database.medicamentos[0].id,
        dosagem: 500,
        frequencia: '4h',
        dataInicio: new Date(Date.now() - 60 * 60 * 1000),
        dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

    const response = await request(app)
      .delete(`/api/medicamentos/${database.medicamentos[0].id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
