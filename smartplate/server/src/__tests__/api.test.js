import request from 'supertest';
import app from '../app.js';
import { pool } from '../db/index.js';

describe('SmartPlate API Integration Tests', () => {
  let authToken = '';

  // Teardown database connection after all tests
  afterAll(async () => {
    await pool.end();
  });

  describe('Infrastructure Check', () => {
    it('GET /health should return 200 and status ok', async () => {
      const res = await request(app).get('/health');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'ok');
    });
  });

  describe('Authentication Flow', () => {
    const testUser = {
      name: 'Test Runner',
      email: `test_${Date.now()}@example.com`,
      password: 'StrongPassword123!'
    };

    it('should register a new test user', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send(testUser);
      
      // If code handles conflict (409) or success (201/200)
      expect([200, 201]).toContain(res.statusCode);
    });


    it('should login and return a JWT token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token');
      authToken = res.body.token;
    });
  });

  describe('AI Nutrition Interpretation (Authenticated)', () => {
    it('should fail with 401 if token is missing', async () => {
      const res = await request(app)
        .post('/api/nutrition/interpret')
        .send({ text: '3 eggs' });
      expect(res.statusCode).toEqual(401);
    });

    it('should succeed with valid token', async () => {
      const res = await request(app)
        .post('/api/nutrition/interpret')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ text: '3 eggs' });
      
      // We expect 200 (Found) or 404 (Not found in Edamam, but authorized)
      expect([200, 404]).toContain(res.statusCode);
      if (res.statusCode === 200) {
        expect(res.body.data).toBeInstanceOf(Array);
      }
    });

    it('should return 400 if text is missing but token is present', async () => {
      const res = await request(app)
        .post('/api/nutrition/interpret')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});
      expect(res.statusCode).toEqual(400);
    });
  });
});
