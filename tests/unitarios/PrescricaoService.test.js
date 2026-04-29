const database = require('../../src/models/database');
const { ValidationError, ConflictError } = require('../../src/models/errors');

// Mock services for unit tests using in-memory database
const mockMedicamentoService = {
  create: async (dados) => {
    const medicamento = {
      id: require('uuid').v4(),
      nome: dados.nome,
      unidade: dados.unidade,
      intervaloMinimoHoras: dados.intervaloMinimoHoras,
      doseMaximaDiaria: dados.doseMaximaDiaria,
      dataCriacao: new Date(),
      deleted: false,
      deletedAt: null,
    };
    database.medicamentos.push(medicamento);
    return medicamento;
  },
  findById: (id) => {
    const medicamento = database.medicamentos.find(m => m.id === id && !m.deleted);
    if (!medicamento) {
      throw new require('../../src/models/errors').NotFoundError('Medicamento nao encontrado');
    }
    return medicamento;
  }
};

const mockUserService = {
  create: async (email, senha, nome) => {
    const user = {
      id: require('uuid').v4(),
      email,
      senha: await require('../../src/services/auth.service').hashPassword(senha),
      nome,
      role: 'USER',
      dataCriacao: new Date(),
      deleted: false,
      deletedAt: null,
    };
    database.users.push(user);
    return user;
  }
};

// Mock the services before importing
jest.mock('../../src/services/MedicamentoService', () => mockMedicamentoService);
jest.mock('../../src/services/UserService', () => mockUserService);

const PrescricaoService = require('../../src/services/PrescricaoService');

describe('PrescricaoService', () => {
  let userId;
  let medicamentoId;

  beforeEach(async () => {
    await database.reset();
    const user = await mockUserService.create(`user${Date.now()}@teste.com`, 'senha123', 'Test User');
    userId = user.id;

    // Use default medications from database
    medicamentoId = database.medicamentos[0].id; // Paracetamol
  });

  describe('create', () => {
    it('should create a prescription successfully', () => {
      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const prescricao = PrescricaoService.create(
        {
          medicamentoId,
          dosagem: 500,
          frequencia: '8h',
          dataInicio: today,
          dataFim: nextMonth,
        },
        userId
      );

      expect(prescricao).toHaveProperty('id');
      expect(prescricao.dosagem).toBe(500);
      expect(prescricao.frequencia).toBe('8h');
    });

    it('should throw error with invalid frequency', () => {
      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      expect(() => {
        PrescricaoService.create(
          {
            medicamentoId: medicamentoId,
            dosagem: 500,
            frequencia: '2h',
            dataInicio: today,
            dataFim: nextMonth,
          },
          userId
        );
      }).toThrow(ValidationError);
    });

    it('should throw error when end date is before start date', () => {
      const today = new Date();
      const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

      expect(() => {
        PrescricaoService.create(
          {
            medicamentoId: medicamentoId,
            dosagem: 500,
            frequencia: '8h',
            dataInicio: today,
            dataFim: yesterday,
          },
          userId
        );
      }).toThrow(ValidationError);
    });

    it('should detect medication interactions', async () => {
      const med2Id = database.medicamentos[1].id; // Ibuprofeno

      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Criar primeira prescrição
      await PrescricaoService.create(
        {
          medicamentoId: medicamentoId,
          dosagem: 500,
          frequencia: '8h',
          dataInicio: today,
          dataFim: nextMonth,
        },
        userId
      );

      // Criar segunda prescrição (deve detectar interação)
      const prescricao = await PrescricaoService.create(
        {
          medicamentoId: med2Id,
          dosagem: 400,
          frequencia: '8h',
          dataInicio: today,
          dataFim: nextMonth,
        },
        userId
      );

      expect(prescricao.alertas).not.toBeNull();
      expect(prescricao.alertas.tipo).toBe('INTERACAO_MEDICAMENTOSA');
    });
  });

  describe('validations', () => {
    it('should validate prescription period', () => {
      const today = new Date();
      const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

      expect(() => {
        PrescricaoService.create(
          {
            medicamentoId: medicamentoId,
            dosagem: 500,
            frequencia: '8h',
            dataInicio: tomorrow,
            dataFim: tomorrow,
          },
          userId
        );
      }).toThrow(ValidationError);
    });

    it('should throw error with invalid dosage', () => {
      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      expect(() => {
        PrescricaoService.create(
          {
            medicamentoId: medicamentoId,
            dosagem: 0,
            frequencia: '8h',
            dataInicio: today,
            dataFim: nextMonth,
          },
          userId
        );
      }).toThrow(ValidationError);
    });
  });
});
