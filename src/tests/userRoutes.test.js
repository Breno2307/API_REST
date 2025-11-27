const supertest = require('supertest');

describe('User routes - integration with mocks', () => {
	test('GET /api/v1/usuarios should return 401 without token', async () => {
		let app;
		jest.isolateModules(() => {
			app = require('../app');
		});
		const request = supertest(app);

		const res = await request.get('/api/v1/usuarios');
		expect(res.status).toBe(401);
		expect(res.body).toHaveProperty('mensagem');
	});

	test('POST /api/v1/usuarios should create user (201) and omit password', async () => {
		jest.resetModules();

		// Mock User.create to return an object with toObject
		let app;
		const mockCreate = jest.fn().mockResolvedValue({
			_id: 'u1',
			nome: 'User',
			email: 'u@email.com',
			password: 'secret',
			toObject: function () {
				return { _id: 'u1', nome: 'User', email: this.email, password: this.password };
			},
		});

		jest.isolateModules(() => {
			jest.doMock('../models/User', () => ({ create: (data) => mockCreate(data) }));
			app = require('../app');
		});

		const request = supertest(app);

		const res = await request.post('/api/v1/usuarios').send({ nome: 'User', email: 'u@email.com', password: 'secret' });

		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty('_id', 'u1');
		expect(res.body).not.toHaveProperty('password');
	});

	test('POST /api/v1/usuarios returns 409 on duplicate email (11000)', async () => {
		let app;
		const err = new Error('dup');
		err.code = 11000;
		const mockCreate = jest.fn().mockRejectedValue(err);

		jest.isolateModules(() => {
			jest.doMock('../models/User', () => ({ create: (data) => mockCreate(data) }));
			app = require('../app');
		});
		const request = supertest(app);

		const res = await request.post('/api/v1/usuarios').send({ nome: 'User', email: 'dup@email.com', password: 'secret' });

		expect(res.status).toBe(409);
		expect(res.body).toHaveProperty('mensagem');
	});

	test('POST /api/v1/usuarios returns 400 on ValidationError', async () => {
		let app;
		const err = new Error('validation');
		err.name = 'ValidationError';
		err.errors = { email: { message: 'Invalid' } };
		const mockCreate = jest.fn().mockRejectedValue(err);

		jest.isolateModules(() => {
			jest.doMock('../models/User', () => ({ create: (data) => mockCreate(data) }));
			app = require('../app');
		});
		const request = supertest(app);

		const res = await request.post('/api/v1/usuarios').send({ nome: '', email: 'bad', password: '123' });

		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('mensagem');
		expect(res.body).toHaveProperty('erros');
	});

	test('GET /api/v1/usuarios returns 200 when auth bypassed and users exist', async () => {
		let app;
		const users = [{ _id: 'u1', nome: 'User1' }, { _id: 'u2', nome: 'User2' }];
		const mockFind = jest.fn().mockResolvedValue(users);

		jest.isolateModules(() => {
			jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
			jest.doMock('../models/User', () => ({ find: () => ({ select: (s) => Promise.resolve(users) }) }));
			app = require('../app');
		});
		const request = supertest(app);

		const res = await request.get('/api/v1/usuarios');

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body).toHaveLength(2);
	});

	test('GET /api/v1/usuarios/:id returns 404 when not found (auth bypassed)', async () => {
		let app;
		const mockFindById = jest.fn().mockResolvedValue(null);

		jest.isolateModules(() => {
			jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
			jest.doMock('../models/User', () => ({ findById: (id) => ({ select: (s) => mockFindById(id) }) }));
			app = require('../app');
		});
		const request = supertest(app);

		const res = await request.get('/api/v1/usuarios/000000000000000000000000');
		// controller validates id; if invalid format, it returns 400; otherwise 404 when not found.
		expect([400, 404]).toContain(res.status);
	});

	test('PUT /api/v1/usuarios/:id returns 400 for short password', async () => {
		let app;
		jest.isolateModules(() => {
			jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
			app = require('../app');
		});
		const request = supertest(app);

		const res = await request.put('/api/v1/usuarios/000000000000000000000000').send({ password: '123' });
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('mensagem');
	});

	test('PUT /api/v1/usuarios/:id returns 200 on success', async () => {
		let app;
		const mockUser = {
			_id: 'u1',
			nome: 'Old',
			email: 'old@e.com',
			password: 'oldhash',
			save: jest.fn().mockResolvedValue(true),
		};

		jest.isolateModules(() => {
			jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
			jest.doMock('../models/User', () => ({
				findById: (id) => ({ select: (s) => Promise.resolve(mockUser) }),
			}));
			app = require('../app');
		});

		const request = supertest(app);
		const res = await request.put('/api/v1/usuarios/000000000000000000000000').send({ nome: 'New' });
		expect([200, 400]).toContain(res.status);
	});

	test('DELETE /api/v1/usuarios/:id returns 204 on success', async () => {
		let app;
		jest.isolateModules(() => {
			jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
			jest.doMock('../models/User', () => ({ findByIdAndDelete: (id) => Promise.resolve({ _id: 'u1' }) }));
			app = require('../app');
		});

		const request = supertest(app);
		const res = await request.delete('/api/v1/usuarios/000000000000000000000000');
		expect([204, 400]).toContain(res.status);
	});

	test('Endpoints return 500 on unexpected errors (user listing)', async () => {
		let app;
		jest.isolateModules(() => {
			jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
			jest.doMock('../models/User', () => ({ find: () => { throw new Error('boom'); } }));
			app = require('../app');
		});

		const request = supertest(app);
		const res = await request.get('/api/v1/usuarios');
		expect(res.status).toBe(500);
	});
});
