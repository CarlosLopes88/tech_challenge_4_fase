const request = require('supertest');
const app = require('../src/application/interfaces/web/server');
const mongoose = require('mongoose');

describe('Testes de Integração do Microserviço de Produtos', () => {
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

  it('Deve criar e buscar um produto por ID', async () => {
    const novoProduto = {
      nomeProduto: 'Produto Teste',
      descricaoProduto: 'Descrição do Produto Teste',
      precoProduto: 19.99,
      categoriaProduto: 'Categoria Teste',
    };

    const resPost = await request(app).post('/api/produto').send(novoProduto);
    expect(resPost.status).toBe(201);

    const resGet = await request(app).get(`/api/produto/${resPost.body.produtoId}`);
    expect(resGet.status).toBe(200);
    expect(resGet.body.nomeProduto).toBe('Produto Teste');
  });
});
