const database = require('../../src/models/database');
const { ValidationError } = require('../../src/models/errors');

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

const RegistroUsoService = require('../../src/services/RegistroUsoService');
const PrescricaoService = require('../../src/services/PrescricaoService');

describe('RegistroUsoService', () => {
  let userId;
  let prescricaoId;

  beforeEach(async () => {
    await database.reset();
    const user = await mockUserService.create(`user${Date.now()}@teste.com`, 'senha123', 'Test User');
    userId = user.id;

    const medicamento = await mockMedicamentoService.create({
      nome: 'Paracetamol',
      unidade: 'mg',
      intervaloMinimoHoras: 4,
      doseMaximaDiaria: 4000
    });
    medicamentoId = medicamento.id;

    const today = new Date();
    const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const prescricao = await PrescricaoService.create(
      {
        medicamentoId,
        dosagem: 500,
        frequencia: '4h',
        dataInicio: today,
        dataFim: nextMonth,
      },
      userId
    );
    prescricaoId = prescricao.id;
  });

  describe('create', () => {
    it('should create a usage record successfully', () => {
      const agora = new Date();
      const registro = RegistroUsoService.create(
        {
          prescricaoId,
          dosagem: 500,
          dataHora: agora,
        },
        userId,
        'USER'
      );

      expect(registro).toHaveProperty('id');
      expect(registro.dosagem).toBe(500);
    });

    it('should throw error for duplicate record at same time', () => {
      const agora = new Date();

      RegistroUsoService.create(
        {
          prescricaoId,
          dosagem: 500,
          dataHora: agora,
        },
        userId,
        'USER'
      );

      expect(() => {
        RegistroUsoService.create(
          {
            prescricaoId,
            dosagem: 500,
            dataHora: agora,
          },
          userId,
          'USER'
        );
      }).toThrow(ValidationError);
    });
  });

  describe('minimum interval validation', () => {
    it('should enforce minimum interval between doses', () => {
      const agora = new Date();
      const doisHoras = new Date(agora.getTime() + 2 * 60 * 60 * 1000);

      RegistroUsoService.create(
        {
          prescricaoId,
          dosagem: 500,
          dataHora: agora,
        },
        userId,
        'USER'
      );

      expect(() => {
        RegistroUsoService.create(
          {
            prescricaoId,
            dosagem: 500,
            dataHora: doisHoras,
          },
          userId,
          'USER'
        );
      }).toThrow(ValidationError);
    });

    it('should allow dose after minimum interval', () => {
      const agora = new Date();
      const quatroHoras = new Date(agora.getTime() + 4.5 * 60 * 60 * 1000);

      RegistroUsoService.create(
        {
          prescricaoId,
          dosagem: 500,
          dataHora: agora,
        },
        userId,
        'USER'
      );

      const registro = RegistroUsoService.create(
        {
          prescricaoId,
          dosagem: 500,
          dataHora: quatroHoras,
        },
        userId,
        'USER'
      );

      expect(registro).toHaveProperty('id');
    });
  });

  describe('maximum daily dose validation', () => {
    it('should alert when reaching 80% of max daily dose', () => {
      // Paracetamol tem dose máxima diária de 4000mg
      const agora = new Date();

      const registro = RegistroUsoService.create(
        {
          prescricaoId,
          dosagem: 3200, // 80% de 4000
          dataHora: agora,
        },
        userId,
        'USER'
      );

      expect(registro.alertas).toBeDefined();
      expect(registro.alertas.length).toBeGreaterThan(0);
    });

    it('should throw error when exceeding max daily dose', () => {
      const agora = new Date();

      RegistroUsoService.create(
        {
          prescricaoId,
          dosagem: 2500,
          dataHora: agora,
        },
        userId,
        'USER'
      );

      const duasHoras = new Date(agora.getTime() + 2.5 * 60 * 60 * 1000);

      expect(() => {
        RegistroUsoService.create(
          {
            prescricaoId,
            dosagem: 2000, // Total 4500, exceeds 4000
            dataHora: duasHoras,
          },
          userId,
          'USER'
        );
      }).toThrow(ValidationError);
    });
  });

  describe('prescription period validation', () => {
    it('should throw error for usage before prescription start', () => {
      const prescricao = PrescricaoService.findById(prescricaoId);
      const antesDoInicio = new Date(prescricao.dataInicio.getTime() - 24 * 60 * 60 * 1000);

      expect(() => {
        RegistroUsoService.create(
          {
            prescricaoId,
            dosagem: 500,
            dataHora: antesDoInicio,
          },
          userId,
          'USER'
        );
      }).toThrow(ValidationError);
    });

    it('should throw error for usage after prescription end', () => {
      const prescricao = PrescricaoService.findById(prescricaoId);
      const depoisDoFim = new Date(prescricao.dataFim.getTime() + 24 * 60 * 60 * 1000);

      expect(() => {
        RegistroUsoService.create(
          {
            prescricaoId,
            dosagem: 500,
            dataHora: depoisDoFim,
          },
          userId,
          'USER'
        );
      }).toThrow(ValidationError);
    });
  });

  describe('delete', () => {
    it('should soft delete a usage record', () => {
      const agora = new Date();
      const registro = RegistroUsoService.create(
        {
          prescricaoId,
          dosagem: 500,
          dataHora: agora,
        },
        userId,
        'USER'
      );

      RegistroUsoService.delete(registro.id);

      expect(() => {
        RegistroUsoService.findById(registro.id);
      }).toThrow();
    });
  });
});
