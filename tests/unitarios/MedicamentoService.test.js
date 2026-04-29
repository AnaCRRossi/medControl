const MedicamentoService = require('../../src/services/MedicamentoService');
const { ValidationError, ConflictError, NotFoundError } = require('../../src/models/errors');

const prisma = MedicamentoService.prisma;

describe('MedicamentoService', () => {
  beforeAll(async () => {
    // Clear medications table before all tests
    await prisma.medication.deleteMany();
  });

  beforeEach(async () => {
    // Clear medications table before each test
    await prisma.medication.deleteMany();
  });

  afterAll(async () => {
    // Clean up after all tests
    await prisma.medication.deleteMany();
  });

  describe('create', () => {
    it('should create a new medicamento successfully', async () => {
      const medicamento = await MedicamentoService.create({
        nome: 'Dipirona',
        descricao: 'Analgésico',
        intervaloMinimoHoras: 6,
        doseMáximaDiaria: 3000,
        unidade: 'mg',
      });

      expect(medicamento).toHaveProperty('id');
      expect(medicamento.name).toBe('dipirona');
      expect(medicamento.minIntervalHours).toBe(6);
    });

    it('should throw error when medicamento with same name exists', async () => {
      await MedicamentoService.create({
        nome: 'Aspirina',
        intervaloMinimoHoras: 4,
        doseMáximaDiaria: 2000,
        unidade: 'mg',
      });

      await expect(MedicamentoService.create({
        nome: 'Aspirina',
        intervaloMinimoHoras: 4,
        doseMáximaDiaria: 2000,
        unidade: 'mg',
      })).rejects.toThrow(ConflictError);
    });

    it('should throw error with invalid intervalo minimo', async () => {
      await expect(MedicamentoService.create({
        nome: 'Aspirin',
        intervaloMinimoHoras: 0,
        doseMáximaDiaria: 2000,
        unidade: 'mg',
      })).rejects.toThrow(ValidationError);
    });
  });

  describe('findById', () => {
    it('should return medicamento by id', async () => {
      const novo = await MedicamentoService.create({
        nome: 'Cefalexina',
        intervaloMinimoHoras: 6,
        doseMáximaDiaria: 3000,
        unidade: 'mg',
      });

      const medicamento = await MedicamentoService.findById(novo.id);
      expect(medicamento.id).toBe(novo.id);
      expect(medicamento.name).toBe('cefalexina');
    });

    it('should throw error when medicamento not found', async () => {
      await expect(MedicamentoService.findById('id-inexistente')).rejects.toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should return all medicamentos', async () => {
      const todos = await MedicamentoService.findAll();
      expect(Array.isArray(todos)).toBe(true);
    });
  });

  describe('update', () => {
    it('should update medicamento successfully', async () => {
      const novo = await MedicamentoService.create({
        nome: 'Medicamento Original',
        intervaloMinimoHoras: 4,
        doseMáximaDiaria: 2000,
        unidade: 'mg',
      });

      const atualizado = await MedicamentoService.update(novo.id, {
        intervaloMinimoHoras: 6,
      });

      expect(atualizado.minIntervalHours).toBe(6);
    });

    it('should throw error when medicamento not found', async () => {
      await expect(MedicamentoService.update('id-inexistente', { nome: 'Novo' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should soft delete medicamento', async () => {
      const novo = await MedicamentoService.create({
        nome: 'Medicamento Teste',
        intervaloMinimoHoras: 4,
        doseMáximaDiaria: 2000,
        unidade: 'mg',
      });

      await MedicamentoService.delete(novo.id);

      await expect(MedicamentoService.findById(novo.id)).rejects.toThrow(NotFoundError);
    });
  });
});
