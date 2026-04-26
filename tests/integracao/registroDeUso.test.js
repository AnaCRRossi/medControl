const request = require('supertest');
const app = require('../../src/app');
const database = require('../../src/models/database');
const { generateToken } = require('../../src/services/authService');

function criarPaciente() {
  const id = `user-${Date.now()}-${Math.random()}`;
  database.users.push({
    id,
    email: `${id}@teste.com`,
    senha: Buffer.from('senha123').toString('base64'),
    nome: 'Paciente Registro',
    tipo: 'USER',
    dataCriacao: new Date(),
    deleted: false,
    deletedAt: null,
  });
  return { id, token: generateToken(id, 'USER') };
}

async function criarPrescricao(token, overrides = {}) {
  const response = await request(app)
    .post('/api/prescricoes')
    .set('Authorization', `Bearer ${token}`)
    .send({
      medicamentoId: database.medicamentos[0].id,
      dosagem: 500,
      frequencia: '4h',
      dataInicio: new Date(Date.now() - 24 * 60 * 60 * 1000),
      dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000),
      ...overrides,
    });

  return response.body.data;
}

describe('Registro de uso', () => {
  beforeEach(() => {
    database.reset();
  });

  it('cria registro valido respeitando intervalo e retorna 201', async () => {
    const paciente = criarPaciente();
    const prescricao = await criarPrescricao(paciente.token);

    const response = await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        prescricaoId: prescricao.id,
        dosagem: 500,
        dataHora: new Date(),
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('rejeita registro antes do intervalo minimo e retorna 400', async () => {
    const paciente = criarPaciente();
    const prescricao = await criarPrescricao(paciente.token);
    const primeiraDose = new Date();

    await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        prescricaoId: prescricao.id,
        dosagem: 500,
        dataHora: primeiraDose,
      });

    const response = await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        prescricaoId: prescricao.id,
        dosagem: 500,
        dataHora: new Date(primeiraDose.getTime() + 60 * 60 * 1000),
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('registra dose dentro do limite diario e retorna 201', async () => {
    const paciente = criarPaciente();
    const prescricao = await criarPrescricao(paciente.token);

    const response = await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        prescricaoId: prescricao.id,
        dosagem: 1000,
        dataHora: new Date(),
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('rejeita dose acima do limite diario e retorna 400', async () => {
    const paciente = criarPaciente();
    const prescricao = await criarPrescricao(paciente.token);

    const response = await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        prescricaoId: prescricao.id,
        dosagem: 5000,
        dataHora: new Date(),
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('retorna alerta ao atingir pelo menos 80 por cento do limite diario', async () => {
    const paciente = criarPaciente();
    const prescricao = await criarPrescricao(paciente.token);

    const response = await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        prescricaoId: prescricao.id,
        dosagem: 3200,
        dataHora: new Date(),
      });

    expect(response.status).toBe(201);
    expect(response.body.data.alertas.length).toBeGreaterThan(0);
    expect(response.body.data.alertas[0].tipo).toBe('AVISO_DOSE_MAXIMA');
  });

  it('aceita uso dentro do periodo da prescricao', async () => {
    const paciente = criarPaciente();
    const prescricao = await criarPrescricao(paciente.token);

    const response = await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        prescricaoId: prescricao.id,
        dosagem: 500,
        dataHora: new Date(),
      });

    expect(response.status).toBe(201);
  });

  it('rejeita uso antes da data de inicio e retorna 400', async () => {
    const paciente = criarPaciente();
    const inicio = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const fim = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const prescricao = await criarPrescricao(paciente.token, {
      dataInicio: inicio,
      dataFim: fim,
    });

    const response = await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        prescricaoId: prescricao.id,
        dosagem: 500,
        dataHora: new Date(),
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('rejeita uso apos data de fim e retorna 400', async () => {
    const paciente = criarPaciente();
    const inicio = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const fim = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const prescricao = await criarPrescricao(paciente.token, {
      dataInicio: inicio,
      dataFim: fim,
    });

    const response = await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        prescricaoId: prescricao.id,
        dosagem: 500,
        dataHora: new Date(),
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('rejeita duplicidade de horario e retorna 400', async () => {
    const paciente = criarPaciente();
    const prescricao = await criarPrescricao(paciente.token);
    const dataHora = new Date();

    await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        prescricaoId: prescricao.id,
        dosagem: 500,
        dataHora,
      });

    const response = await request(app)
      .post('/api/registros-uso')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        prescricaoId: prescricao.id,
        dosagem: 500,
        dataHora,
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });
});
