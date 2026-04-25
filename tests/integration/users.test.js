const request = require('supertest');
const app = require('../../src/app');
const database = require('../../src/database/database');
const { generateToken } = require('../../src/utils/auth');

describe('User API Integration Tests', () => {
  beforeEach(() => {
    database.reset();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'newuser@teste.com',
          senha: 'senha123',
          nome: 'Novo Usuário',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.email).toBe('newuser@teste.com');
    });

    it('should not register user with duplicate email', async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'user@teste.com',
          senha: 'senha123',
          nome: 'User 1',
        });

      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'user@teste.com',
          senha: 'senha123',
          nome: 'User 2',
        });

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
    });

    it('should not register with invalid email', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'invalid-email',
          senha: 'senha123',
          nome: 'User',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/users/login', () => {
    it('should login successfully', async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'login@teste.com',
          senha: 'senha123',
          nome: 'Test User',
        });

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login@teste.com',
          senha: 'senha123',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
    });

    it('should not login with wrong password', async () => {
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'login@teste.com',
          senha: 'senha123',
          nome: 'Test User',
        });

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login@teste.com',
          senha: 'wrongpassword',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/profile', () => {
    it('should get user profile with valid token', async () => {
      const user = database.users[0]; // Admin padrão
      const token = generateToken(user.id, user.tipo);

      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(user.email);
    });

    it('should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
});
