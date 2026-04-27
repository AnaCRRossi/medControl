const request = require('supertest');
const app = require('../../src/app');

describe('Authentication Tests', () => {
  it('should return 401 for request without token', async () => {
    const res = await request(app).get('/api/medicamentos');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token de autenticação necessário');
  });

  it('should return 401 for invalid token', async () => {
    const res = await request(app)
      .get('/api/medicamentos')
      .set('Authorization', 'Bearer invalidtoken');

    expect(res.status).toBe(401);
    expect(res.body.message).toBe('Token inválido');
  });

  it('should return 401 for malformed token', async () => {
    const res = await request(app)
      .get('/api/medicamentos')
      .set('Authorization', 'Bearer');

    expect(res.status).toBe(401);
  });
});