const request = require('supertest');
const app = require('../../src/app');
const database = require('../../src/models/database');
const { generateToken } = require('../../src/services/authService');

function createUser(email = 'patient@test.com') {
  const response = request(app)
    .post('/api/users/register')
    .send({
      email,
      senha: 'senha123',
      nome: 'Patient Test',
    });

  return response;
}

describe('Soft delete endpoints', () => {
  let adminToken;

  beforeEach(() => {
    database.reset();
    adminToken = generateToken(database.users[0].id, 'ADMIN');
  });

  it('deletes a patient and removes it from default listings', async () => {
    const created = await createUser('delete.patient@test.com');
    const patientId = created.body.data.id;

    const deleted = await request(app)
      .delete(`/api/pacientes/${patientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.data.deletedAt).toBeDefined();

    const users = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(users.body.data.find(user => user.id === patientId)).toBeUndefined();
  });

  it('does not delete a patient with usage history', async () => {
    const created = await createUser('history.patient@test.com');
    const patientId = created.body.data.id;
    const patientToken = generateToken(patientId, 'USER');

    const prescription = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        medicamentoId: database.medicamentos[0].id,
        dosagem: 500,
        frequencia: '4h',
        dataInicio: new Date(Date.now() - 60 * 60 * 1000),
        dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

    await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        prescricaoId: prescription.body.data.id,
        dosagem: 500,
        dataHora: new Date(),
      });

    const deleted = await request(app)
      .delete(`/api/pacientes/${patientId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleted.status).toBe(409);
  });

  it('deletes a medication and removes it from default listings', async () => {
    const medication = await request(app)
      .post('/api/medicamentos')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        nome: 'Medication Delete',
        intervaloMinimoHoras: 6,
        doseMaximaDiaria: 2000,
        unidade: 'mg',
      });

    const medicationId = medication.body.data.id;

    const deleted = await request(app)
      .delete(`/api/medicamentos/${medicationId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.data.deletedAt).toBeDefined();

    const list = await request(app)
      .get('/api/medicamentos')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(list.body.data.find(item => item.id === medicationId)).toBeUndefined();
  });

  it('does not delete a medication with an active prescription', async () => {
    const created = await createUser('medication.patient@test.com');
    const patientId = created.body.data.id;
    const patientToken = generateToken(patientId, 'USER');

    await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        medicamentoId: database.medicamentos[0].id,
        dosagem: 500,
        frequencia: '4h',
        dataInicio: new Date(Date.now() - 60 * 60 * 1000),
        dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

    const deleted = await request(app)
      .delete(`/api/medicamentos/${database.medicamentos[0].id}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleted.status).toBe(409);
  });

  it('deletes an inactive prescription and removes it from default listings', async () => {
    const created = await createUser('prescription.patient@test.com');
    const patientId = created.body.data.id;
    const patientToken = generateToken(patientId, 'USER');

    const prescription = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        medicamentoId: database.medicamentos[0].id,
        dosagem: 500,
        frequencia: '4h',
        dataInicio: new Date(Date.now() - 72 * 60 * 60 * 1000),
        dataFim: new Date(Date.now() - 48 * 60 * 60 * 1000),
      });

    const prescriptionId = prescription.body.data.id;

    const deleted = await request(app)
      .delete(`/api/prescricoes/${prescriptionId}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.data.deletedAt).toBeDefined();

    const list = await request(app)
      .get(`/api/prescricoes/usuario/${patientId}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(list.body.data.find(item => item.id === prescriptionId)).toBeUndefined();
  });

  it('does not delete an active prescription', async () => {
    const created = await createUser('active.prescription@test.com');
    const patientId = created.body.data.id;
    const patientToken = generateToken(patientId, 'USER');

    const prescription = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        medicamentoId: database.medicamentos[0].id,
        dosagem: 500,
        frequencia: '4h',
        dataInicio: new Date(Date.now() - 60 * 60 * 1000),
        dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

    const deleted = await request(app)
      .delete(`/api/prescricoes/${prescription.body.data.id}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(deleted.status).toBe(409);
  });

  it('deletes a usage record and removes it from default listings', async () => {
    const created = await createUser('usage.patient@test.com');
    const patientId = created.body.data.id;
    const patientToken = generateToken(patientId, 'USER');

    const prescription = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        medicamentoId: database.medicamentos[0].id,
        dosagem: 500,
        frequencia: '4h',
        dataInicio: new Date(Date.now() - 60 * 60 * 1000),
        dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

    const usage = await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${patientToken}`)
      .send({
        prescricaoId: prescription.body.data.id,
        dosagem: 500,
        dataHora: new Date(),
      });

    const deleted = await request(app)
      .delete(`/api/registros-uso/${usage.body.data.id}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(deleted.status).toBe(200);
    expect(deleted.body.data.deletedAt).toBeDefined();

    const list = await request(app)
      .get(`/api/registros-uso/usuario/${patientId}`)
      .set('Authorization', `Bearer ${patientToken}`);

    expect(list.body.data.find(item => item.id === usage.body.data.id)).toBeUndefined();
  });
});
