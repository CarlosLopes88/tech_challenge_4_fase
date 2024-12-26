const request = require('supertest');
const express = require('express');
const { connectToDatabase, disconnectDatabase, clearDatabase } = require('./testDbConnect');
const axios = require('axios');
const Pedido = require('../src/core/domain/pedido');

jest.mock('axios');

describe('Testes das rotas de Pedido', () => {
   let app;
   let server;
   let db_test;
   let PedidoService;
   
   beforeAll(async () => {
       app = express();
       app.use(express.json());

       db_test = await connectToDatabase();
       
       const PedidoRepository = require('../src/infrastructure/repositories/pedidoRepository');
       PedidoService = require('../src/core/user_cases/pedidoService');
       const pedidoRoutes = require('../src/aplication/interfaces/api/pedidoRoutes');
       
       const pedidoRepository = new PedidoRepository();
       const pedidoService = new PedidoService(pedidoRepository);
       app.use('/api/pedido', pedidoRoutes(pedidoRepository, pedidoService));
       
       server = app.listen(3025);
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

   it('Deve retornar erro quando repositório não é fornecido', () => {
       expect(() => {
           require('../src/aplication/interfaces/api/pedidoRoutes')(null, {});
       }).toThrow("pedidoRepository e pedidoService são obrigatórios");
   });

   it('Deve criar um novo pedido', async () => {
       const novoPedido = {
           cliente: "cliente-123",
           produtos: [{
               produto: "produto-123",
               quantidade: 2
           }]
       };

       const res = await request(app)
           .post('/api/pedido')
           .send(novoPedido);

       expect(res.status).toBe(201);
       expect(res.body.cliente).toBe('cliente-123');
       expect(res.body.total).toBe(20.00);
   });

   it('Deve retornar erro quando produtos não é um array', async () => {
       const pedidoInvalido = {
           cliente: "cliente-123",
           produtos: "não é um array"
       };

       const res = await request(app)
           .post('/api/pedido')
           .send(pedidoInvalido);

       expect(res.status).toBe(400);
       expect(res.body.message).toBe("Dados inválidos. Produtos é obrigatório e deve ser um array");
   });

   it('Deve retornar 404 quando pedido não existe', async () => {
       const res = await request(app)
           .get('/api/pedido/pedido-inexistente');

       expect(res.status).toBe(404);
       expect(res.body.message).toBe('Pedido não encontrado.');
   });

   it('Deve listar pedidos ativos', async () => {
       await Pedido.create({
           cliente: '12345',
           produtos: [{
               produto: '67890',
               nomeProduto: 'Produto Teste',
               precoProduto: 10.00,
               quantidade: 1
           }],
           total: 10.00,
           status: 'Recebido'
       });

       const res = await request(app)
           .get('/api/pedido/ativos');

       expect(res.status).toBe(200);
       expect(Array.isArray(res.body)).toBe(true);
       expect(res.body.length).toBe(1);
   });

   it('Deve retornar 404 quando não existem pedidos', async () => {
       const res = await request(app)
           .get('/api/pedido');

       expect(res.status).toBe(404);
       expect(res.body.message).toBe("Nenhum pedido encontrado.");
   });

   it('Deve retornar 500 quando ocorre erro ao buscar pedidos', async () => {
       const PedidoRepository = require('../src/infrastructure/repositories/pedidoRepository');
       jest.spyOn(PedidoRepository.prototype, 'getAllPedidos')
           .mockRejectedValueOnce(new Error('Erro de conexão'));

       const res = await request(app)
           .get('/api/pedido');

       expect(res.status).toBe(500);
       expect(res.body.message).toBe("Erro no servidor");
   });

   it('Deve validar dados obrigatórios do pedido', async () => {
       const res = await request(app)
           .post('/api/pedido')
           .send({});

       expect(res.status).toBe(400);
       expect(res.body.message).toBeDefined();
   });

   it('Deve atualizar status do pedido', async () => {
       const pedido = await Pedido.create({
           cliente: '12345',
           produtos: [{
               produto: '67890',
               nomeProduto: 'Produto Teste',
               precoProduto: 10.00,
               quantidade: 1
           }],
           total: 10.00,
           status: 'Recebido'
       });

       const res = await request(app)
           .put(`/api/pedido/${pedido.pedidoId}/status`)
           .send({ novoStatus: 'Em Preparação' });

       expect(res.status).toBe(200);
       expect(res.body.status).toBe('Em Preparação');
   });

   it('Deve retornar 400 ao tentar atualizar status sem fornecer novoStatus', async () => {
       const pedido = await Pedido.create({
           cliente: '12345',
           produtos: [{
               produto: '67890',
               nomeProduto: 'Produto Teste',
               precoProduto: 10.00,
               quantidade: 1
           }],
           total: 10.00,
           status: 'Recebido'
       });

       const res = await request(app)
           .put(`/api/pedido/${pedido.pedidoId}/status`)
           .send({});

       expect(res.status).toBe(400);
       expect(res.body.message).toBe("Dados inválidos. novoStatus é obrigatório");
   });

   it('Deve retornar 500 quando ocorre erro interno ao criar pedido', async () => {
       const novoPedido = {
           cliente: "cliente-123",
           produtos: [{
               produto: "produto-123",
               quantidade: 2
           }]
       };

       jest.spyOn(PedidoService.prototype, 'criarPedido')
           .mockRejectedValueOnce(new Error('Erro interno'));

       const res = await request(app)
           .post('/api/pedido')
           .send(novoPedido);

       expect(res.status).toBe(500);
       expect(res.body.message).toBe("Erro no servidor");
       expect(res.body.error).toBe("Erro interno");
   });
});