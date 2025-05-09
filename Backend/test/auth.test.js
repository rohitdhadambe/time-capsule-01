require('dotenv').config();
const request = require('supertest');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const { sequelize } = require('../src/config/db');
const User = require('../src/models/User');

// Extend Jest timeout for DB operations (e.g., CI or slow setups)
jest.setTimeout(20000);

// Test user data
const testUser = {
  username: 'testuser',
  email: 'test@example.com',
  password: 'password123'
};

// Setup DB before tests
beforeAll(async () => {
  try {
    await sequelize.authenticate(); // Ensure DB is reachable
    await sequelize.sync({ force: true }); // Reset DB
    console.log('✅ Database synced');
  } catch (err) {
    console.error('❌ Failed to setup DB for tests:', err);
    throw err;
  }
});

// Teardown DB after tests
afterAll(async () => {
  try {
    await sequelize.close();
    console.log('✅ Database connection closed');
  } catch (err) {
    console.error('❌ Failed to close DB connection:', err);
  }
});

describe('Authentication API', () => {
  // Test user registration
  describe('POST /auth/register', () => {
    it('should register a new user and return token', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toHaveProperty('id');
      expect(res.body.user.username).toBe(testUser.username);
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty('password');

      // Verify token is valid
      const decoded = jwt.verify(res.body.token, process.env.JWT_SECRET);
      expect(decoded).toHaveProperty('id');
    });

    it('should reject registration with existing email', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send(testUser);

      expect(res.statusCode).toBe(409);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject registration with invalid data', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          username: 'a', // Too short
          email: 'not-an-email',
          password: '123' // Too short
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  // Test user login
  describe('POST /auth/login', () => {
    it('should login existing user and return token', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.email).toBe(testUser.email);
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword'
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password
        });

      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('error');
    });
  });
});
