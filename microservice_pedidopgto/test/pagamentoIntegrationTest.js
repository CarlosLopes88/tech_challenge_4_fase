const request = require('supertest');
const app = require('../src/application/interfaces/web/server');
const mongoose = require('mongoose');

describe('Testes de Integração - Microserviço Pagamentos', () => {
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

    it('Deve criar um pagamento para um pedido', async () => {
        const pedidoId = '67890';
        const res = await request(app).post(`/api/pagamento/${pedidoId}`).send();
        expect(res.status).toBe(201);
        expect(res.body.pedidoId).toBe(pedidoId);
    });
});
