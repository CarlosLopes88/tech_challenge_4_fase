const ProdutoRepositoryInterface = require('../src/core/repositoriesInterfaces/produtoRepositoryInterface');

describe('Testes do ProdutoRepositoryInterface', () => {
    let repositoryInterface;

    beforeEach(() => {
        repositoryInterface = new ProdutoRepositoryInterface();
    });

    it('Deve lançar erro ao chamar addProduto não implementado', async () => {
        await expect(repositoryInterface.addProduto({}))
            .rejects
            .toThrow('Method not implemented: addProduto');
    });

    it('Deve lançar erro ao chamar getProdutoByProdutoId não implementado', async () => {
        await expect(repositoryInterface.getProdutoByProdutoId('123'))
            .rejects
            .toThrow('Method not implemented: getProdutoByProdutoId');
    });

    it('Deve lançar erro ao chamar getAllProdutos não implementado', async () => {
        await expect(repositoryInterface.getAllProdutos())
            .rejects
            .toThrow('Method not implemented: getAllProdutos');
    });

    it('Deve lançar erro ao chamar getProdutosByCategoria não implementado', async () => {
        await expect(repositoryInterface.getProdutosByCategoria('categoria'))
            .rejects
            .toThrow('Method not implemented: getProdutosByCategoria');
    });

    it('Deve lançar erro ao chamar updateProduto não implementado', async () => {
        await expect(repositoryInterface.updateProduto('123', {}))
            .rejects
            .toThrow('Method not implemented: updateProduto');
    });

    it('Deve lançar erro ao chamar deleteProduto não implementado', async () => {
        await expect(repositoryInterface.deleteProduto('123'))
            .rejects
            .toThrow('Method not implemented: deleteProduto');
    });
});