const database = require('../../src/database/database');
const MedicamentoService = require('../../src/services/MedicamentoService');
const { ValidationError, ConflictError, NotFoundError } = require('../../src/utils/errors');

describe('MedicamentoService', () => {
  beforeEach(() => {
    database.reset();
  });

  describe('create', () => {
    it('should create a new medicamento successfully', () => {
      const medicamento = MedicamentoService.create({
        nome: 'Dipirona',
        descricao: 'Analgésico',
        intervaloMinimoHoras: 6,
        doseMáximaDiaria: 3000,
        unidade: 'mg',
      });

      expect(medicamento).toHaveProperty('id');
      expect(medicamento.nome).toBe('Dipirona');
      expect(medicamento.intervaloMinimoHoras).toBe(6);
    });

    it('should throw error when medicamento with same name exists', () => {
      MedicamentoService.create({
        nome: 'Aspirina',
        intervaloMinimoHoras: 4,
        doseMáximaDiaria: 2000,
        unidade: 'mg',
      });

      expect(() => {
        MedicamentoService.create({
          nome: 'Aspirina',
          intervaloMinimoHoras: 4,
          doseMáximaDiaria: 2000,
          unidade: 'mg',
        });
      }).toThrow(ConflictError);
    });

    it('should throw error with invalid intervalo minimo', () => {
      expect(() => {
        MedicamentoService.create({
          nome: 'Aspirin',
          intervaloMinimoHoras: 0,
          doseMáximaDiaria: 2000,
          unidade: 'mg',
        });
      }).toThrow(ValidationError);
    });
  });

  describe('findById', () => {
    it('should return medicamento by id', () => {
      const novo = MedicamentoService.create({
        nome: 'Cefalexina',
        intervaloMinimoHoras: 6,
        doseMáximaDiaria: 3000,
        unidade: 'mg',
      });

      const medicamento = MedicamentoService.findById(novo.id);
      expect(medicamento.id).toBe(novo.id);
      expect(medicamento.nome).toBe('Cefalexina');
    });

    it('should throw error when medicamento not found', () => {
      expect(() => {
        MedicamentoService.findById('id-inexistente');
      }).toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should return all medicamentos', () => {
      const todos = MedicamentoService.findAll();
      expect(Array.isArray(todos)).toBe(true);
      expect(todos.length).toBeGreaterThan(0);
    });
  });

  describe('update', () => {
    it('should update medicamento successfully', () => {
      const novo = MedicamentoService.create({
        nome: 'Medicamento Original',
        intervaloMinimoHoras: 4,
        doseMáximaDiaria: 2000,
        unidade: 'mg',
      });

      const atualizado = MedicamentoService.update(novo.id, {
        doseMáximaDiaria: 3000,
        descricao: 'Descrição atualizada',
      });

      expect(atualizado.doseMáximaDiaria).toBe(3000);
      expect(atualizado.descricao).toBe('Descrição atualizada');
    });

    it('should throw error when medicamento not found', () => {
      expect(() => {
        MedicamentoService.update('id-inexistente', { nome: 'Novo' });
      }).toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should soft delete medicamento', () => {
      const novo = MedicamentoService.create({
        nome: 'Medicamento Teste',
        intervaloMinimoHoras: 4,
        doseMáximaDiaria: 2000,
        unidade: 'mg',
      });

      MedicamentoService.delete(novo.id);

      expect(() => {
        MedicamentoService.findById(novo.id);
      }).toThrow(NotFoundError);
    });
  });
});
