const request = require('supertest');
const app = require('../src/application/interfaces/web/server');
const PagamentoService = require('../src/core/use_cases/pagamentoServices');

jest.mock('../src/core/use_cases/pagamentoServices');

describe('Testes das Rotas de Pagamento', () => {
    beforeEach(() => {
        PagamentoService.mockClear();
    });

    it('Deve criar um novo pagamento', async () => {
        PagamentoService.prototype.criarPagamento.mockResolvedValue({
            pedidoId: '67890',
            valor: 31.98,
            status: 'Pendente',
        });

        const res = await request(app).post('/api/pagamento/67890').send();
        expect(res.status).toBe(201);
        expect(res.body.pedidoId).toBe('67890');
    });

    it('Deve retornar erro ao criar pagamento para pedido inexistente', async () => {
        PagamentoService.prototype.criarPagamento.mockRejectedValue(new Error('Pedido não encontrado'));

        const res = await request(app).post('/api/pagamento/12345').send();
        expect(res.status).toBe(500);
    });
});
