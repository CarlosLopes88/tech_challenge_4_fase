const mongoose = require('mongoose');
const Produto = require('../src/core/domain/produto');
const ProdutoRepository = require('../src/infrastructure/repositories/produtoRepository');

describe('Testes do ProdutoRepository', () => {
  let produtoRepository;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    produtoRepository = new ProdutoRepository();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('Deve adicionar um novo produto', async () => {
    const produto = await produtoRepository.addProduto({
      nomeProduto: 'Produto Teste',
      descricaoProduto: 'Descrição do Produto Teste',
      precoProduto: 19.99,
      categoriaProduto: 'Categoria Teste',
    });

    expect(produto.produtoId).toBeDefined();
    expect(produto.nomeProduto).toBe('Produto Teste');
  });

  it('Deve retornar todos os produtos', async () => {
    const produtos = await produtoRepository.getAllProdutos();
    expect(produtos.length).toBeGreaterThan(0);
  });
});
    