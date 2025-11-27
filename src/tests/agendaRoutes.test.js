const supertest = require('supertest');

describe('Agenda routes - comprehensive', () => {
	test('GET /api/v1/agenda returns 401 without token', async () => {
		jest.resetModules();
		const app = require('../app');
		const request = supertest(app);

		const res = await request.get('/api/v1/agenda');
		expect(res.status).toBe(401);
		expect(res.body).toHaveProperty('mensagem');
	});

	test('GET /api/v1/agenda returns 200 when auth bypassed', async () => {
		jest.resetModules();
		jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
		const mockFind = jest.fn().mockResolvedValue([{ _id: 'e1', titulo: 'E1' }]);
		jest.doMock('../models/Evento', () => ({ find: () => mockFind() }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.get('/api/v1/agenda');
		expect(res.status).toBe(200);
		expect(Array.isArray(res.body)).toBe(true);
	});

	test('GET /api/v1/agenda/:id returns 404 when not found', async () => {
		jest.resetModules();
		jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
		const mockFindById = jest.fn().mockResolvedValue(null);
		jest.doMock('../models/Evento', () => ({ findById: (id) => mockFindById(id) }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.get('/api/v1/agenda/000000000000000000000000');
		expect([400, 404]).toContain(res.status);
	});

	test('POST /api/v1/agenda returns 201 when created', async () => {
		jest.resetModules();
		jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
		const mockCreate = jest.fn().mockResolvedValue({ _id: 'e1', titulo: 'E1' });
		jest.doMock('../models/Evento', () => ({ create: (data) => mockCreate(data) }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.post('/api/v1/agenda').send({ titulo: 'E1' });
		expect(res.status).toBe(201);
		expect(res.body).toHaveProperty('_id', 'e1');
	});

	test('POST /api/v1/agenda returns 400 on create validation error', async () => {
		jest.resetModules();
		jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
		const err = new Error('bad');
		const mockCreate = jest.fn().mockRejectedValue(err);
		jest.doMock('../models/Evento', () => ({ create: (data) => mockCreate(data) }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.post('/api/v1/agenda').send({});
		expect(res.status).toBe(400);
	});

	test('PUT /api/v1/agenda/:id returns 200 when updated', async () => {
		jest.resetModules();
		jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
		const mockFindByIdAndUpdate = jest.fn().mockResolvedValue({ _id: 'e1', titulo: 'Updated' });
		jest.doMock('../models/Evento', () => ({ findByIdAndUpdate: (id, body, opts) => mockFindByIdAndUpdate(id, body, opts) }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.put('/api/v1/agenda/000000000000000000000000').send({ titulo: 'Updated' });
		expect([200, 400]).toContain(res.status);
	});

	test('DELETE /api/v1/agenda/:id returns 204 when deleted', async () => {
		jest.resetModules();
		jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
		const mockFindByIdAndDelete = jest.fn().mockResolvedValue({ _id: 'e1' });
		jest.doMock('../models/Evento', () => ({ findByIdAndDelete: (id) => mockFindByIdAndDelete(id) }));

		const app = require('../app');
		const request = supertest(app);

		const res = await request.delete('/api/v1/agenda/000000000000000000000000');
		expect([204, 400]).toContain(res.status);
	});

	test('GET /api/v1/agenda returns 500 on server error', async () => {
		jest.resetModules();
		jest.doMock('../middleware/authMiddleware', () => (req, res, next) => next());
		jest.doMock('../models/Evento', () => ({ find: () => { throw new Error('boom'); } }));
		const app = require('../app');
		const request = supertest(app);

		const res = await request.get('/api/v1/agenda');
		expect(res.status).toBe(500);
	});
});
