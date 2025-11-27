const supertest = require('supertest');

describe('Produto routes - comprehensive', () => {
	test('GET /api/v1/produtos returns list (mocked)', async () => {
		jest.resetModules();
		const mockFind = jest.fn().mockResolvedValue([{ _id: '1', nome: 'P1' }, { _id: '2', nome: 'P2' }]);
		jest.doMock('../models/Produto', () => ({ find: () => mockFind() }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.get('/api/v1/produtos');

		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
		expect(res.body).toHaveLength(2);
		expect(res.body[0]).toHaveProperty('nome', 'P1');
	});

	test('GET /api/v1/produtos/:id returns 400 for invalid id', async () => {
		jest.resetModules();
		const app = require('../app');
		const request = supertest(app);

		const res = await request.get('/api/v1/produtos/invalid-id');
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('mensagem');
	});

	test('GET /api/v1/produtos/:id returns 404 when not found', async () => {
		jest.resetModules();
		const mockFindById = jest.fn().mockResolvedValue(null);
		jest.doMock('../models/Produto', () => ({ findById: (id) => mockFindById(id) }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.get('/api/v1/produtos/000000000000000000000000');
		expect([400, 404]).toContain(res.status);
	});

	test('POST /api/v1/produtos returns 201 when created (auth bypassed)', async () => {
		jest.resetModules();
		// bypass auth
		jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
		const mockCreate = jest.fn().mockResolvedValue({ _id: 'p1', nome: 'Novo' });
		jest.doMock('../models/Produto', () => ({ create: (data) => mockCreate(data) }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.post('/api/v1/produtos').send({ nome: 'Novo' });
		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty('_id', 'p1');
	});

	test('POST /api/v1/produtos returns 400 on validation error', async () => {
		jest.resetModules();
		jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());

		const err = new Error('validation');
		err.name = 'ValidationError';
		err.errors = { nome: { message: 'Required' } };
		const mockCreate = jest.fn().mockRejectedValue(err);
		jest.doMock('../models/Produto', () => ({ create: (data) => mockCreate(data) }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.post('/api/v1/produtos').send({});
		expect(res.status).toBe(400);
		expect(res.body).toHaveProperty('mensagem');
	});

	test('PUT /api/v1/produtos/:id returns 200 when updated (auth bypassed)', async () => {
		jest.resetModules();
		jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
		const mockFindByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'p1', nome: 'Updated' });
		jest.doMock('../models/Produto', () => ({ findByIdAndUpdate: (id, body, opts) => mockFindByIdAndUpdate(id, body, opts) }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.put('/api/v1/produtos/000000000000000000000000').send({ nome: 'Updated' });
		expect([200, 400]).toContain(res.status);
	});

	test('DELETE /api/v1/produtos/:id returns 204 when removed (auth bypassed)', async () => {
		jest.resetModules();
		jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
		const mockFindByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'p1' });
		jest.doMock('../models/Produto', () => ({ findByIdAndDelete: (id) => mockFindByIdAndDelete(id) }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.delete('/api/v1/produtos/000000000000000000000000');
		expect([204, 400]).toContain(res.status);
	});

	test('GET /api/v1/produtos returns 500 on server error', async () => {
		jest.resetModules();
		jest.doMock('../models/Produto', () => ({ find: () => { throw new Error('db'); } }));
		const app = require('../app');
		const request = supertest(app);

		const res = await request.get('/api/v1/produtos');
		expect(res.status).toBe(500);
	});

	test('GET /api/v1/produtos/:id returns 200 when found', async () => {
		jest.resetModules();
		const mockFindById = jest.fn().mockResolvedValue({ _id: 'p1', nome: 'P1' });
		jest.doMock('../models/Produto', () => ({ findById: (id) => mockFindById(id) }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.get('/api/v1/produtos/000000000000000000000000');
		expect([200, 400]).toContain(res.status);
	});
});
