const PedidoRepositoryInterface = require('../src/core/repositoriesInterfaces/pedidoRepositoryInterface');

describe('Testes do PedidoRepositoryInterface', () => {
    let repositoryInterface;

    beforeEach(() => {
        repositoryInterface = new PedidoRepositoryInterface();
    });

    it('Deve lançar erro ao chamar addPedido não implementado', async () => {
        await expect(repositoryInterface.addPedido({}))
            .rejects
            .toThrow('Method not implemented: addPedido');
    });

    it('Deve lançar erro ao chamar getPedidoByPedidoId não implementado', async () => {
        await expect(repositoryInterface.getPedidoByPedidoId('123'))
            .rejects
            .toThrow('Method not implemented: getPedidoByPedidoId');
    });

    it('Deve lançar erro ao chamar getAllPedidos não implementado', async () => {
        await expect(repositoryInterface.getAllPedidos())
            .rejects
            .toThrow('Method not implemented: getAllPedidos');
    });

    it('Deve lançar erro ao chamar getPedidos não implementado', async () => {
        await expect(repositoryInterface.getPedidos())
            .rejects
            .toThrow('Method not implemented: getPedidos');
    });

    it('Deve lançar erro ao chamar updatePedidoStatus não implementado', async () => {
        await expect(repositoryInterface.updatePedidoStatus('123', 'status'))
            .rejects
            .toThrow('Method not implemented: updatePedidoStatus');
    });

    it('Deve lançar erro ao chamar updateStatusPagamento não implementado', async () => {
        await expect(repositoryInterface.updateStatusPagamento('123', 'status'))
            .rejects
            .toThrow('Method not implemented: updateStatusPagamento');
    });
});