const request = require('supertest');
const app = require('../../src/app');
const database = require('../../src/models/database');
const { generateToken } = require('../../src/services/authService');
const MedicamentoService = require('../../src/services/MedicamentoService');

function criarPaciente() {
  const id = `user-${Date.now()}-${Math.random()}`;
  database.users.push({
    id,
    email: `${id}@teste.com`,
    senha: Buffer.from('senha123').toString('base64'),
    nome: 'Paciente Prescricao',
    tipo: 'USER',
    dataCriacao: new Date(),
    deleted: false,
    deletedAt: null,
  });
  return { id, token: generateToken(id, 'USER') };
}

function prescricaoBase(medicamentoId = database.medicamentos[2].id) {
  return {
    medicamentoId,
    dosagem: 500,
    frequencia: '8h',
    dataInicio: new Date(Date.now() - 60 * 60 * 1000),
    dataFim: new Date(Date.now() + 24 * 60 * 60 * 1000),
  };
}

describe('Prescricao', () => {
  beforeEach(async () => {
    await database.reset();
    // Garantir que há medicamentos suficientes no banco
    while (database.medicamentos.length < 3) {
      await MedicamentoService.create(
        `Medicamento ${database.medicamentos.length + 1}`,
        'Descrição do medicamento',
        4,
        4000,
        'mg'
      );
    }
  });

  it('cria prescricao valida e retorna 201', async () => {
    const paciente = criarPaciente();

    const response = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send(prescricaoBase());

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
  });

  it('nao cria prescricao sem dose e retorna 400', async () => {
    const paciente = criarPaciente();
    const body = prescricaoBase();
    delete body.dosagem;

    const response = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send(body);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('nao cria prescricao sem medicamento e retorna 400', async () => {
    const paciente = criarPaciente();
    const body = prescricaoBase();
    delete body.medicamentoId;

    const response = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send(body);

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('nao cria prescricao com dose zero e retorna 400', async () => {
    const paciente = criarPaciente();

    const response = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({ ...prescricaoBase(), dosagem: 0 });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('aceita frequencia valida', async () => {
    const paciente = criarPaciente();

    const response = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({ ...prescricaoBase(database.medicamentos[0].id), frequencia: '4h' });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('rejeita frequencia inconsistente com intervalo minimo', async () => {
    const paciente = criarPaciente();

    const response = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({ ...prescricaoBase(database.medicamentos[0].id), frequencia: '2h' });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  it('cadastra prescricao sem interacao medicamentosa', async () => {
    const paciente = criarPaciente();

    const response = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send(prescricaoBase(database.medicamentos[2].id));

    expect(response.status).toBe(201);
    expect(response.body.data.alertas).toBeNull();
  });

  it('cadastra prescricao com interacao e retorna alerta detalhado', async () => {
    const paciente = criarPaciente();

    await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        ...prescricaoBase(database.medicamentos[0].id),
        frequencia: '4h',
      });

    const response = await request(app)
      .post('/api/prescricoes')
      .set('Authorization', `Bearer ${paciente.token}`)
      .send({
        ...prescricaoBase(database.medicamentos[1].id),
        frequencia: '6h',
      });

    expect(response.status).toBe(201);
    expect(response.body.data.alertas).toBeDefined();
    expect(response.body.data.alertas.detalhes[0]).toHaveProperty('medicamentos');
    expect(response.body.data.alertas.detalhes[0]).toHaveProperty('nivelRisco');
    expect(response.body.data.alertas.detalhes[0]).toHaveProperty('descricao');
  });
});
