const request = require('supertest');
const app = require('../src/application/interfaces/web/server');
const mongoose = require('mongoose');

describe('Testes de Integração - Microserviço Pedidos', () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    it('Deve criar e buscar um pedido por ID', async () => {
        const novoPedido = {
            cliente: '12345',
            produtos: [{ produto: '23456', quantidade: 2 }]
        };

        const resPost = await request(app).post('/api/pedido').send(novoPedido);
        expect(resPost.status).toBe(201);

        const resGet = await request(app).get(`/api/pedido/${resPost.body.pedidoId}`);
        expect(resGet.status).toBe(200);
        expect(resGet.body.cliente).toBe('12345');
    });

    it('Deve buscar todos os pedidos ativos', async () => {
        const res = await request(app).get('/api/pedido/ativos');
        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});
