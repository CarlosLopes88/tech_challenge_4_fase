const Produto = require('../src/core/domain/produto');
const ProdutoRepository = require('../src/infrastructure/repositories/produtoRepository');
const { connectToDatabase, disconnectDatabase, clearDatabase } = require('./testDbConnect');

describe('Testes do ProdutoRepository', () => {
    let produtoRepository;
    let db_test;

    beforeAll(async () => {
        db_test = await connectToDatabase();
        produtoRepository = new ProdutoRepository();
    }, 30000);

    afterAll(async () => {
        await disconnectDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    it('Deve adicionar um novo produto', async () => {
        const produto = await produtoRepository.addProduto({
            nomeProduto: 'Produto Teste',
            descricaoProduto: 'Descrição do Produto Teste',
            precoProduto: 19.99,
            categoriaProduto: 'Categoria Teste'
        });

        expect(produto.produtoId).toBeDefined();
        expect(produto.nomeProduto).toBe('Produto Teste');
    });

    it('Deve falhar ao adicionar produto com nome duplicado', async () => {
        const produtoData = {
            nomeProduto: 'Produto Teste',
            descricaoProduto: 'Descrição do Produto Teste',
            precoProduto: 19.99,
            categoriaProduto: 'Categoria Teste'
        };

        await produtoRepository.addProduto(produtoData);
        await expect(produtoRepository.addProduto(produtoData))
            .rejects
            .toThrow('Produto com este nome já existe.');
    });

    it('Deve buscar produto por ID', async () => {
        const novoProduto = await produtoRepository.addProduto({
            nomeProduto: 'Produto Busca ID',
            descricaoProduto: 'Descrição Busca ID',
            precoProduto: 29.99,
            categoriaProduto: 'Categoria Teste'
        });

        const produtoEncontrado = await produtoRepository.getProdutoByProdutoId(novoProduto.produtoId);
        expect(produtoEncontrado).toBeDefined();
        expect(produtoEncontrado.nomeProduto).toBe('Produto Busca ID');
    });

    it('Deve retornar null para ID inexistente', async () => {
        const produto = await produtoRepository.getProdutoByProdutoId('id_inexistente');
        expect(produto).toBeNull();
    });

    it('Deve retornar produtos por categoria', async () => {
        await produtoRepository.addProduto({
            nomeProduto: 'Produto Categoria 1',
            descricaoProduto: 'Descrição 1',
            precoProduto: 19.99,
            categoriaProduto: 'Teste'
        });

        await produtoRepository.addProduto({
            nomeProduto: 'Produto Categoria 2',
            descricaoProduto: 'Descrição 2',
            precoProduto: 29.99,
            categoriaProduto: 'Outra'
        });

        const produtos = await produtoRepository.getProdutosByCategoria('Teste');
        expect(produtos).toHaveLength(1);
        expect(produtos[0].nomeProduto).toBe('Produto Categoria 1');
    });

    it('Deve atualizar um produto', async () => {
        const produto = await produtoRepository.addProduto({
            nomeProduto: 'Produto Original',
            descricaoProduto: 'Descrição Original',
            precoProduto: 19.99,
            categoriaProduto: 'Categoria Original'
        });

        const produtoAtualizado = await produtoRepository.updateProduto(produto.produtoId, {
            nomeProduto: 'Produto Atualizado'
        });

        expect(produtoAtualizado.nomeProduto).toBe('Produto Atualizado');
    });

    it('Deve deletar um produto', async () => {
        const produto = await produtoRepository.addProduto({
            nomeProduto: 'Produto para Deletar',
            descricaoProduto: 'Descrição Delete',
            precoProduto: 19.99,
            categoriaProduto: 'Categoria Delete'
        });

        const deletado = await produtoRepository.deleteProduto(produto.produtoId);
        expect(deletado).toBeDefined();

        const buscaProduto = await produtoRepository.getProdutoByProdutoId(produto.produtoId);
        expect(buscaProduto).toBeNull();
    });
});