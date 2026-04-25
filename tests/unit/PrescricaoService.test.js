const database = require('../../src/database/database');
const PrescricaoService = require('../../src/services/PrescricaoService');
const UserService = require('../../src/services/UserService');
const MedicamentoService = require('../../src/services/MedicamentoService');
const { ValidationError, ConflictError } = require('../../src/utils/errors');

describe('PrescricaoService', () => {
  let userId;
  let medicamentoId;

  beforeEach(() => {
    database.reset();
    // Criar um usuário de teste
    const user = UserService.create('user@teste.com', 'senha123', 'Test User');
    userId = user.id;

    // Usar medicamento padrão ou criar um novo
    medicamentoId = database.medicamentos[0].id;
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
            medicamentoId,
            dosagem: 500,
            frequencia: '4h',
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
            medicamentoId,
            dosagem: 500,
            frequencia: '8h',
            dataInicio: today,
            dataFim: yesterday,
          },
          userId
        );
      }).toThrow(ValidationError);
    });

    it('should detect medication interactions', () => {
      const med1 = database.medicamentos[0]; // Paracetamol
      const med2 = database.medicamentos[1]; // Ibuprofeno

      const today = new Date();
      const nextMonth = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      // Criar primeira prescrição
      PrescricaoService.create(
        {
          medicamentoId: med1.id,
          dosagem: 500,
          frequencia: '8h',
          dataInicio: today,
          dataFim: nextMonth,
        },
        userId
      );

      // Criar segunda prescrição (deve detectar interação)
      const prescricao = PrescricaoService.create(
        {
          medicamentoId: med2.id,
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
            medicamentoId,
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
            medicamentoId,
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
