const { PrismaClient } = require('@prisma/client');
const UserService = require('../../src/services/UserService');
const { ValidationError, ConflictError, NotFoundError } = require('../../src/models/errors');

const prisma = new PrismaClient();

describe('UserService', () => {
  beforeAll(async () => {
    // Clear users table before all tests
    await prisma.user.deleteMany();
  });

  beforeEach(async () => {
    // Clear users table before each test
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    // Clean up after all tests
    await prisma.user.deleteMany();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const resultado = await UserService.create(
        'novo@teste.com',
        'senha123',
        'Novo Usuário'
      );

      expect(resultado).toHaveProperty('id');
      expect(resultado.email).toBe('novo@teste.com');
      expect(resultado.name).toBe('Novo Usuário');
      expect(resultado.role).toBe('USER');
    });

    it('should throw error when email already exists', async () => {
      await UserService.create('email@teste.com', 'senha123', 'User 1');

      await expect(UserService.create('email@teste.com', 'senha123', 'User 2')).rejects.toThrow(ConflictError);
    });

    it('should throw error with invalid email', async () => {
      await expect(UserService.create('email-invalido', 'senha123', 'User')).rejects.toThrow(ValidationError);
    });

    it('should throw error when required fields are missing', async () => {
      await expect(UserService.create('', 'senha123', 'User')).rejects.toThrow(ValidationError);
    });
  });
});
