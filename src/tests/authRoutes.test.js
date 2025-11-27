const supertest = require('supertest');

describe('Auth routes - login', () => {
  test('POST /auth/login returns 400 when missing fields', async () => {
    let app;
    jest.isolateModules(() => {
      app = require('../app');
    });
    const request = supertest(app);

    const res = await request.post('/auth/login').send({ email: '' });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('mensagem');
  });

  test('POST /auth/login returns 401 when user not found', async () => {
    let app;
    jest.isolateModules(() => {
      // findOne should return an object with select() that resolves to null
      jest.doMock('../models/User', () => ({ findOne: (q) => ({ select: (s) => Promise.resolve(null) }) }));
      app = require('../app');
    });
    const request = supertest(app);

    const res = await request.post('/auth/login').send({ email: 'no@one.com', password: 'x' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('mensagem');
  });

  test('POST /auth/login returns 401 on wrong password', async () => {
    let app;
    jest.isolateModules(() => {
      const user = { _id: 'u1', email: 'u@e.com', password: '$2a$10$hash' };
      jest.doMock('../models/User', () => ({ findOne: (q) => ({ select: (s) => Promise.resolve(user) }) }));
      // mock bcrypt before requiring app so controller uses mocked bcrypt
      jest.doMock('bcryptjs', () => ({ compare: () => Promise.resolve(false) }));
      app = require('../app');
    });

    const request = supertest(app);

    const res = await request.post('/auth/login').send({ email: 'u@e.com', password: 'wrong' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('mensagem');
  });

  test('POST /auth/login returns 200 with token and usuario on success', async () => {
    let app;
    jest.isolateModules(() => {
      const user = { _id: 'u1', nome: 'User', email: 'u@e.com', password: '$2a$10$hash' };
      jest.doMock('../models/User', () => ({ findOne: (q) => ({ select: (s) => Promise.resolve(user) }) }));
      // mock bcrypt and jsonwebtoken before requiring app
      jest.doMock('bcryptjs', () => ({ compare: () => Promise.resolve(true) }));
      jest.doMock('jsonwebtoken', () => ({ sign: () => 'token123' }));
      app = require('../app');
    });

    const request = supertest(app);

    const res = await request.post('/auth/login').send({ email: 'u@e.com', password: 'right' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token', 'token123');
    expect(res.body).toHaveProperty('usuario');
  });
  test('POST /auth/login returns 500 on unexpected error', async () => {
    jest.resetModules();
    const mockFindOne = jest.fn().mockImplementation(() => { throw new Error('db'); });
    jest.doMock('../models/User', () => ({ findOne: (q) => mockFindOne(q) }));

    const app = require('../app');
    const request = supertest(app);

    const res = await request.post('/auth/login').send({ email: 'x@x.com', password: 'x' });
    expect(res.status).toBe(500);
  });
});
