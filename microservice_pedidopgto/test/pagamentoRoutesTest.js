const request = require('supertest');
const express = require('express');
const { connectToDatabase, disconnectDatabase, clearDatabase } = require('./testDbConnect');
const PagamentoService = require('../src/core/user_cases/pagamentoService');
const PagamentoHttpClient = require('../src/infrastructure/http/pagamentoHttpClient');
const axios = require('axios');

jest.mock('../src/core/user_cases/pagamentoService');
jest.mock('../src/infrastructure/http/pagamentoHttpClient');
jest.mock('axios');

describe('Testes de Pagamento', () => {
    let app;
    let server;
    let db_test;
    let pagamentoHttpClient;

    beforeAll(async () => {
        try {
            app = express();
            app.use(express.json());
            db_test = await connectToDatabase();
            process.env.PAGSEGURO_TOKEN = 'test-token';
            pagamentoHttpClient = new PagamentoHttpClient();
            
            const pagamentoRoutes = require('../src/aplication/interfaces/api/pagamentoRoutes');
            const pagamentoService = new PagamentoService();
            app.use('/api/pagamento', pagamentoRoutes(pagamentoService));
            
            server = app.listen(3034);
        } catch (error) {
            console.error('Erro no setup:', error);
            throw error;
        }
    });

    beforeEach(async () => {
        await clearDatabase().catch(error => {
            console.error('Erro ao limpar banco:', error);
            throw error;
        });
        jest.clearAllMocks();
    });

    afterAll(async () => {
        try {
            await disconnectDatabase();
            if (server) {
                await new Promise((resolve) => server.close(resolve));
            }
        } catch (error) {
            console.error('Erro no teardown:', error);
            throw error;
        }
    });

    it('Deve retornar erro quando pagamentoService não é fornecido', () => {
        expect(() => {
            require('../src/aplication/interfaces/api/pagamentoRoutes')(null);
        }).toThrow("pagamentoService é obrigatório para inicializar pagamentoRoutes");
    });

    it('Deve criar um novo pagamento com sucesso', async () => {
        // Arrange
        const mockPagamento = {
            pedidoId: '12345',
            valor: 100.00,
            status: 'Pendente',
            qrCodeLink: 'http://qrcode.test'
        };

        PagamentoService.prototype.criarPagamento.mockResolvedValue(mockPagamento);

        // Act
        const res = await request(app)
            .post('/api/pagamento/12345')
            .send();

        // Assert
        expect(res.status).toBe(201);
        expect(res.body).toEqual(mockPagamento);
        expect(PagamentoService.prototype.criarPagamento).toHaveBeenCalledWith('12345');
    });

    it('Deve retornar 404 quando pedido não existe', async () => {
        // Arrange
        const error = new Error('Pedido não encontrado');
        error.status = 404;
        PagamentoService.prototype.criarPagamento.mockRejectedValue(error);

        // Act
        const res = await request(app)
            .post('/api/pagamento/999')
            .send();

        // Assert
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Pedido não encontrado');
        expect(PagamentoService.prototype.criarPagamento).toHaveBeenCalledWith('999');
    });
});