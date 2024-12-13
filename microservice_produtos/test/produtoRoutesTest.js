const request = require('supertest');
const app = require('../src/application/interfaces/web/server');
const ProdutoRepository = require('../src/infrastructure/repositories/produtoRepository');

jest.mock('../src/infrastructure/repositories/produtoRepository');

describe('Testes das Rotas de Produto', () => {
  beforeEach(() => {
    ProdutoRepository.mockClear();
  });

  it('Deve criar um novo produto', async () => {
    ProdutoRepository.prototype.addProduto.mockResolvedValue({
      produtoId: '12345',
      nomeProduto: 'Produto Teste',
      descricaoProduto: 'Descrição Teste',
      precoProduto: 19.99,
      categoriaProduto: 'Categoria Teste',
    });

    const res = await request(app).post('/api/produto').send({
      nomeProduto: 'Produto Teste',
      descricaoProduto: 'Descrição Teste',
      precoProduto: 19.99,
      categoriaProduto: 'Categoria Teste',
    });

    expect(res.status).toBe(201);
    expect(res.body.produtoId).toBe('12345');
  });

  it('Deve retornar todos os produtos', async () => {
    ProdutoRepository.prototype.getAllProdutos.mockResolvedValue([
      { produtoId: '12345', nomeProduto: 'Produto 1' },
      { produtoId: '67890', nomeProduto: 'Produto 2' },
    ]);

    const res = await request(app).get('/api/produto');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('Deve retornar erro ao criar produto sem dados obrigatórios', async () => {
    const res = await request(app).post('/api/produto').send({});
    expect(res.status).toBe(400);
  });
});
