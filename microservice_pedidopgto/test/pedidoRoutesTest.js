const request = require('supertest');
const app = require('../src/application/interfaces/web/server');
const PedidoRepository = require('../src/infrastructure/repositories/pedidoRepository');

jest.mock('../src/infrastructure/repositories/pedidoRepository');

describe('Testes das Rotas de Pedido', () => {
    beforeEach(() => {
        PedidoRepository.mockClear();
    });

    it('Deve criar um novo pedido', async () => {
        PedidoRepository.prototype.addPedido.mockResolvedValue({
            pedidoId: '12345',
            cliente: '12345',
            total: 31.98,
            status: 'Recebido',
        });

        const res = await request(app).post('/api/pedido').send({
            cliente: '12345',
            produtos: [{ produto: '23456', quantidade: 2 }]
        });

        expect(res.status).toBe(201);
        expect(res.body.pedidoId).toBe('12345');
    });

    it('Deve retornar erro ao criar pedido sem dados obrigatórios', async () => {
        const res = await request(app).post('/api/pedido').send({});
        expect(res.status).toBe(400);
    });
});
