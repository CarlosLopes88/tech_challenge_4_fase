const request = require('supertest');
const express = require('express');
const Pedido = require('../src/core/domain/pedido');
const { connectToDatabase, disconnectDatabase, clearDatabase } = require('./testDbConnect');
const axios = require('axios');

jest.mock('axios');

describe('Testes de integração do microserviço de pagamentos', () => {
    let app;
    let server;
    let db_test;

    beforeAll(async () => {
        app = express();
        app.use(express.json());

        db_test = await connectToDatabase();
        
        const PagamentoService = require('../src/core/user_cases/pagamentoService');
        const PagamentoHttpClient = require('../src/infrastructure/http/pagamentoHttpClient');
        const PedidoRepository = require('../src/infrastructure/repositories/pedidoRepository');
        const pagamentoRoutes = require('../src/aplication/interfaces/api/pagamentoRoutes');
        
        const pedidoRepository = new PedidoRepository();
        const pagamentoHttpClient = new PagamentoHttpClient();
        const pagamentoService = new PagamentoService(pedidoRepository, pagamentoHttpClient);
        
        app.use('/api/pagamento', pagamentoRoutes(pagamentoService));
        
        server = app.listen(3033);
    });

    afterAll(async () => {
        await disconnectDatabase();
        if (server) {
            await server.close();
        }
    });

    beforeEach(async () => {
        await clearDatabase();
        jest.clearAllMocks();

        // Mock do serviço de cliente
        axios.get.mockImplementation((url) => {
            if (url.includes('/api/cliente/')) {
                return Promise.resolve({
                    data: {
                        cpf: "11122233344",
                        nomeCliente: "Cliente Teste",
                        email: "teste@teste.com"
                    }
                });
            }
            // Mock do serviço de produto
            if (url.includes('/api/produto/')) {
                return Promise.resolve({
                    data: {
                        nomeProduto: "Produto Teste",
                        descricaoProduto: "Descrição teste",
                        precoProduto: 10.00,
                        categoriaProduto: "Categoria Teste"
                    }
                });
            }
            return Promise.reject(new Error('URL não mockada'));
        });

        // Mock do PagSeguro
        axios.post.mockResolvedValue({
            data: {
                qr_codes: [
                    {
                        links: [
                            {},
                            { href: 'http://qrcode.test' }
                        ]
                    }
                ]
            }
        });
    });

    it('Deve criar um pagamento para um pedido', async () => {
        // Criar pedido de teste
        const pedido = await Pedido.create({
            pedidoId: '12345',
            cliente: '98765',
            produtos: [{
                produto: '11111',
                nomeProduto: 'Produto Teste',
                precoProduto: 10.00,
                quantidade: 1
            }],
            total: 10.00,
            status: 'Recebido'
        });

        const res = await request(app)
            .post(`/api/pagamento/${pedido.pedidoId}`)
            .send();

        expect(res.status).toBe(201);
        expect(res.body.pedidoId).toBe(pedido.pedidoId);
        expect(res.body.valor).toBe(pedido.total);
        expect(res.body.status).toBe('Pendente');
        expect(res.body.qrCodeLink).toBeDefined();
    });

    it('Deve retornar 404 para pedido inexistente', async () => {
        const res = await request(app)
            .post('/api/pagamento/pedido-inexistente')
            .send();

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Pedido não encontrado');
    });

    it('Deve lidar com erros do PagSeguro', async () => {
        // Criar pedido de teste
        const pedido = await Pedido.create({
            pedidoId: '12345',
            cliente: '98765',
            total: 10.00,
            status: 'Recebido'
        });

        // Mock de erro do PagSeguro
        axios.post.mockRejectedValueOnce({
            response: {
                status: 500,
                data: { 
                    error_messages: ['Erro no processamento'] 
                }
            }
        });

        const res = await request(app)
            .post(`/api/pagamento/${pedido.pedidoId}`)
            .send();

        expect(res.status).toBe(500);
        expect(res.body.message).toBe('Erro na API do PagSeguro: 500');
    });

    it('Deve lidar com cliente não encontrado', async () => {
        // Criar pedido de teste
        const pedido = await Pedido.create({
            pedidoId: '12345',
            cliente: '98765',
            total: 10.00,
            status: 'Recebido'
        });

        // Mock de erro do serviço de cliente
        axios.get.mockRejectedValueOnce({
            response: {
                status: 404,
                data: { message: 'Cliente não encontrado' }
            }
        });

        const res = await request(app)
            .post(`/api/pagamento/${pedido.pedidoId}`)
            .send();

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Cliente não encontrado');
    });
});