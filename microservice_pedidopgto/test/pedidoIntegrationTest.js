const request = require('supertest');
const express = require('express');
const axios = require('axios');
const { connectToDatabase, disconnectDatabase, clearDatabase } = require('./testDbConnect');

jest.mock('axios');

describe('Testes de integração do microserviço de pedidos', () => {
    let app;
    let server;
    let db_test;

    beforeAll(async () => {
        app = express();
        app.use(express.json());
        db_test = await connectToDatabase();
        
        const PedidoRepository = require('../src/infrastructure/repositories/pedidoRepository');
        const PedidoService = require('../src/core/user_cases/pedidoService');
        const pedidoRoutes = require('../src/aplication/interfaces/api/pedidoRoutes');
        
        const pedidoRepository = new PedidoRepository();
        const pedidoService = new PedidoService(pedidoRepository);
        app.use('/api/pedido', pedidoRoutes(pedidoRepository, pedidoService));
        
        server = app.listen(3035);
    });

    beforeEach(async () => {
        await clearDatabase();
        jest.clearAllMocks();

        // Mock padrão para o serviço de cliente
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
    });

    afterAll(async () => {
        await disconnectDatabase();
        if (server) {
            await server.close();
        }
    });

    it('Deve criar e buscar um pedido por ID', async () => {
        const novoPedido = {
            cliente: "cliente-123",
            produtos: [{
                produto: "produto-123",
                quantidade: 2
            }]
        };

        const resPost = await request(app)
            .post('/api/pedido')
            .send(novoPedido);

        expect(resPost.status).toBe(201);
        expect(resPost.body.pedidoId).toBeDefined();
        expect(resPost.body.cliente).toBe('cliente-123');

        const resGet = await request(app)
            .get(`/api/pedido/${resPost.body.pedidoId}`);

        expect(resGet.status).toBe(200);
        expect(resGet.body.pedidoId).toBe(resPost.body.pedidoId);
    });

    it('Deve retornar 400 para pedido sem produtos', async () => {
        const res = await request(app)
            .post('/api/pedido')
            .send({
                cliente: "cliente-123"
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('Produtos é obrigatório');
    });

    it('Deve retornar 404 quando cliente não existe', async () => {
        axios.get.mockImplementation((url) => {
            if (url.includes('/api/cliente/')) {
                return Promise.reject({
                    response: { 
                        status: 404,
                        data: { message: 'Cliente não encontrado' }
                    }
                });
            }
        });

        const res = await request(app)
            .post('/api/pedido')
            .send({
                cliente: "cliente-inexistente",
                produtos: [{ 
                    produto: "produto-123",
                    quantidade: 1 
                }]
            });

        expect(res.status).toBe(404);
        expect(res.body.message).toContain('não encontrado');
    });

    it('Deve listar pedidos ativos', async () => {
        // Primeiro criar um pedido
        const novoPedido = {
            cliente: "cliente-123",
            produtos: [{
                produto: "produto-123",
                quantidade: 2
            }]
        };

        await request(app)
            .post('/api/pedido')
            .send(novoPedido);

        const res = await request(app)
            .get('/api/pedido/ativos');

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
    });
});