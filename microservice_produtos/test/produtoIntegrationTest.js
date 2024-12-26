// produtoIntegrationTest.js
const request = require('supertest');
const express = require('express');
const Produto = require('../src/core/domain/produto');
const { connectToDatabase, disconnectDatabase, clearDatabase } = require('./testDbConnect');

describe('Testes de integração do microserviço de produtos', () => {
    let app;
    let server;
    let db_test;

    beforeAll(async () => {
        // Configura o Express
        app = express();
        app.use(express.json());

        // Conecta ao MongoDB
        db_test = await connectToDatabase();

        // Configura as rotas
        const ProdutoRepository = require('../src/infrastructure/repositories/produtoRepository');
        const produtoRoutes = require('../src/aplication/interfaces/api/produtoRoutes');
        app.use('/api/produto', produtoRoutes(new ProdutoRepository()));

        // Inicia o servidor em uma porta diferente
        server = app.listen(3032);
    }, 30000);

    afterAll(async () => {
        await disconnectDatabase();
        if (server) {
            await server.close();
        }
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    it('Deve criar e buscar um produto por ID', async () => {
        const novoProduto = {
            nomeProduto: 'Produto Integração',
            descricaoProduto: 'Descrição do Produto Integração',
            precoProduto: 29.99,
            categoriaProduto: 'Categoria Teste'
        };

        const resPost = await request(app)
            .post('/api/produto')
            .send(novoProduto);

        expect(resPost.status).toBe(201);
        expect(resPost.body).toBeDefined();
        expect(resPost.body.produtoId).toBeDefined();
        expect(resPost.body.nomeProduto).toBe('Produto Integração');

        const resGet = await request(app)
            .get(`/api/produto/${resPost.body.produtoId}`);

        expect(resGet.status).toBe(200);
        expect(resGet.body.nomeProduto).toBe('Produto Integração');
    });

    it('Deve retornar 404 para produto não encontrado', async () => {
        const resGet = await request(app)
            .get('/api/produto/produtoInexistente');

        expect(resGet.status).toBe(404);
    });

    it('Deve buscar produtos por categoria', async () => {
        const novoProduto = {
            nomeProduto: 'Produto Categoria',
            descricaoProduto: 'Descrição Categoria',
            precoProduto: 19.99,
            categoriaProduto: 'Teste Categoria'
        };

        await request(app)
            .post('/api/produto')
            .send(novoProduto);

        const resGet = await request(app)
            .get('/api/produto/categoria/Teste Categoria');

        expect(resGet.status).toBe(200);
        expect(resGet.body[0].nomeProduto).toBe('Produto Categoria');
    });

    it('Deve retornar erro ao tentar criar produto duplicado', async () => {
        const produto = {
            nomeProduto: 'Produto Único',
            descricaoProduto: 'Teste Duplicação',
            precoProduto: 19.99,
            categoriaProduto: 'Teste'
        };

        await request(app).post('/api/produto').send(produto);
        const resPost = await request(app).post('/api/produto').send(produto);

        expect(resPost.status).toBe(400);
        expect(resPost.body.message).toBe('Produtos não podem possuir o mesmo nome.');
    });
});