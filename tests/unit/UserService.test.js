const database = require('../../src/database/database');
const UserService = require('../../src/services/UserService');
const { ValidationError, ConflictError, NotFoundError } = require('../../src/utils/errors');

describe('UserService', () => {
  beforeEach(() => {
    database.reset();
  });

  describe('create', () => {
    it('should create a new user successfully', () => {
      const resultado = UserService.create(
        'novo@teste.com',
        'senha123',
        'Novo Usuário'
      );

      expect(resultado).toHaveProperty('id');
      expect(resultado.email).toBe('novo@teste.com');
      expect(resultado.nome).toBe('Novo Usuário');
      expect(resultado.tipo).toBe('USER');
    });

    it('should throw error when email already exists', () => {
      UserService.create('email@teste.com', 'senha123', 'User 1');

      expect(() => {
        UserService.create('email@teste.com', 'senha123', 'User 2');
      }).toThrow(ConflictError);
    });

    it('should throw error with invalid email', () => {
      expect(() => {
        UserService.create('email-invalido', 'senha123', 'User');
      }).toThrow(ValidationError);
    });

    it('should throw error when required fields are missing', () => {
      expect(() => {
        UserService.create('', 'senha123', 'User');
      }).toThrow(ValidationError);
    });
  });

  describe('login', () => {
    it('should login successfully with correct credentials', () => {
      UserService.create('teste@email.com', 'senha123', 'Test User');
      const resultado = UserService.login('teste@email.com', 'senha123');

      expect(resultado).toHaveProperty('token');
      expect(resultado.usuario.email).toBe('teste@email.com');
    });

    it('should throw error with incorrect password', () => {
      UserService.create('teste@email.com', 'senha123', 'Test User');

      expect(() => {
        UserService.login('teste@email.com', 'senhaerrada');
      }).toThrow(ValidationError);
    });

    it('should throw error with non-existent user', () => {
      expect(() => {
        UserService.login('naoexiste@email.com', 'senha123');
      }).toThrow(ValidationError);
    });
  });

  describe('findById', () => {
    it('should return user by id', () => {
      const novo = UserService.create('teste@email.com', 'senha123', 'Test User');
      const usuario = UserService.findById(novo.id);

      expect(usuario.id).toBe(novo.id);
      expect(usuario.email).toBe('teste@email.com');
    });

    it('should throw error when user not found', () => {
      expect(() => {
        UserService.findById('id-inexistente');
      }).toThrow(NotFoundError);
    });
  });

  describe('findAll', () => {
    it('should return all users', () => {
      UserService.create('user1@teste.com', 'senha', 'User 1');
      UserService.create('user2@teste.com', 'senha', 'User 2');

      const usuarios = UserService.findAll();
      expect(usuarios.length).toBeGreaterThan(0);
    });

    it('should not return deleted users', () => {
      const novo = UserService.create('teste@email.com', 'senha123', 'Test User');
      UserService.delete(novo.id);

      const usuarios = UserService.findAll();
      const encontrado = usuarios.find(u => u.id === novo.id);
      expect(encontrado).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should soft delete a user', () => {
      const novo = UserService.create('teste@email.com', 'senha123', 'Test User');
      UserService.delete(novo.id);

      expect(() => {
        UserService.findById(novo.id);
      }).toThrow(NotFoundError);
    });

    it('should throw error when user not found', () => {
      expect(() => {
        UserService.delete('id-inexistente');
      }).toThrow(NotFoundError);
    });
  });
});
