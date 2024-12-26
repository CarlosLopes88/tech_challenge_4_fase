const request = require('supertest');
const express = require('express');
const Produto = require('../src/core/domain/produto');
const ProdutoRepository = require('../src/infrastructure/repositories/produtoRepository');
const { connectToDatabase, disconnectDatabase, clearDatabase } = require('./testDbConnect');

describe('Testes das rotas de Produto', () => {
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
        const produtoRoutes = require('../src/aplication/interfaces/api/produtoRoutes');
        app.use('/api/produto', produtoRoutes(new ProdutoRepository()));
        
        // Inicia o servidor em uma porta diferente
        server = app.listen(3022);
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

    it('Deve criar um novo produto', async () => {
        const novoProduto = {
            nomeProduto: 'Produto Teste',
            descricaoProduto: 'Descrição Teste',
            precoProduto: 19.99,
            categoriaProduto: 'Categoria Teste'
        };

        const res = await request(app)
            .post('/api/produto')
            .send(novoProduto);

        expect(res.status).toBe(201);
        expect(res.body).toBeDefined();
        expect(res.body.nomeProduto).toBe('Produto Teste');
    });

    it('Deve validar produto sem dados obrigatórios', async () => {
        const res = await request(app)
            .post('/api/produto')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body.errors).toBeDefined();
        expect(res.body.message).toBe('Dados inválidos');
    });

    it('Deve lidar com array vazio de produtos', async () => {
        const res = await request(app)
            .post('/api/produto')
            .send([]);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Dados do produto são obrigatórios');
    });

    it('Deve validar preço negativo', async () => {
        const produtoInvalido = {
            nomeProduto: 'Produto Teste',
            descricaoProduto: 'Descrição',
            precoProduto: -10,
            categoriaProduto: 'Categoria'
        };

        const res = await request(app)
            .post('/api/produto')
            .send(produtoInvalido);

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain('Preço do produto deve ser maior que zero');
    });

    it('Deve validar produto sem descrição', async () => {
        const produtoInvalido = {
            nomeProduto: 'Produto Teste',
            precoProduto: 10,
            categoriaProduto: 'Categoria'
        };

        const res = await request(app)
            .post('/api/produto')
            .send(produtoInvalido);

        expect(res.status).toBe(400);
        expect(res.body.errors).toContain('Descrição do produto é obrigatória');
    });

    it('Deve rejeitar produtos com mesmo nome', async () => {
        const produto = {
            nomeProduto: 'Produto Duplicado',
            descricaoProduto: 'Descrição',
            precoProduto: 19.99,
            categoriaProduto: 'Categoria'
        };

        await request(app)
            .post('/api/produto')
            .send(produto);

        const res = await request(app)
            .post('/api/produto')
            .send(produto);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Produtos não podem possuir o mesmo nome.');
    });

    it('Deve retornar 404 quando não existem produtos', async () => {
        const res = await request(app).get('/api/produto');
        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Nenhum produto encontrado.');
    });

    it('Deve retornar produto por categoria', async () => {
        const produto = await Produto.create({
            nomeProduto: 'Produto Categoria',
            descricaoProduto: 'Descrição',
            precoProduto: 19.99,
            categoriaProduto: 'Test Category'
        });

        const res = await request(app)
            .get('/api/produto/categoria/Test Category');

        expect(res.status).toBe(200);
        expect(res.body[0].nomeProduto).toBe('Produto Categoria');
    });

    it('Deve atualizar um produto', async () => {
        const produto = await Produto.create({
            nomeProduto: 'Produto Original',
            descricaoProduto: 'Descrição Original',
            precoProduto: 19.99,
            categoriaProduto: 'Categoria'
        });

        const res = await request(app)
            .put(`/api/produto/${produto.produtoId}`)
            .send({
                nomeProduto: 'Produto Atualizado',
                precoProduto: 29.99
            });

        expect(res.status).toBe(200);
        expect(res.body.nomeProduto).toBe('Produto Atualizado');
        expect(res.body.precoProduto).toBe(29.99);
    });

    it('Deve deletar um produto', async () => {
        const produto = await Produto.create({
            nomeProduto: 'Produto para Deletar',
            descricaoProduto: 'Será deletado',
            precoProduto: 19.99,
            categoriaProduto: 'Categoria'
        });

        const res = await request(app)
            .delete(`/api/produto/${produto.produtoId}`);

        expect(res.status).toBe(200);
        expect(res.body.message).toBe('Produto excluído com sucesso.');

        const produtoDeletado = await Produto.findOne({ produtoId: produto.produtoId });
        expect(produtoDeletado).toBeNull();
    });

    it('Deve retornar 404 ao tentar atualizar produto inexistente', async () => {
        const res = await request(app)
            .put('/api/produto/produtoInexistente')
            .send({
                nomeProduto: 'Produto Atualizado'
            });

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Produto não encontrado.');
    });

    it('Deve retornar 404 ao tentar deletar produto inexistente', async () => {
        const res = await request(app)
            .delete('/api/produto/produtoInexistente');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Produto não encontrado.');
    });

    it('Deve retornar 404 ao buscar categoria inexistente', async () => {
        const res = await request(app)
            .get('/api/produto/categoria/CategoriaInexistente');

        expect(res.status).toBe(404);
        expect(res.body.message).toBe('Nenhum produto encontrado nesta categoria.');
    });
});