const PedidoService = require('../src/core/user_cases/pedidoService');
const axios = require('axios');

jest.mock('axios');

describe('Testes do PedidoService', () => {
    let pedidoService;
    let mockPedidoRepository;

    beforeEach(() => {
        // Mock do repositório
        mockPedidoRepository = {
            addPedido: jest.fn(),
            updatePedidoStatus: jest.fn(),
            getPedidoByPedidoId: jest.fn()
        };

        pedidoService = new PedidoService(mockPedidoRepository);
        jest.clearAllMocks();
    });

    describe('calcularTotal', () => {
        it('Deve lançar erro quando produto não é encontrado', async () => {
            // Arrange
            const pedidoData = {
                produtos: [
                    {
                        produto: "produto-inexistente",
                        quantidade: 1
                    }
                ]
            };

            // Mock do axios para simular produto não encontrado
            axios.get.mockRejectedValue({
                response: {
                    status: 404,
                    data: { message: 'Produto não encontrado' }
                }
            });

            // Act & Assert
            await expect(pedidoService.calcularTotal(pedidoData))
                .rejects
                .toThrow('Produto não encontrado');

            // Verifica se o axios.get foi chamado com o produto correto
            expect(axios.get).toHaveBeenCalledWith(
                expect.stringContaining('/api/produto/produto-inexistente')
            );
        });

        it('Deve calcular o total corretamente para múltiplos produtos', async () => {
            // Arrange
            const pedidoData = {
                produtos: [
                    {
                        produto: "produto-1",
                        quantidade: 2
                    },
                    {
                        produto: "produto-2",
                        quantidade: 3
                    }
                ]
            };
    
            // Mock das respostas do axios para cada produto
            axios.get
                .mockResolvedValueOnce({
                    data: {
                        nomeProduto: "Produto 1",
                        precoProduto: 10.00
                    }
                })
                .mockResolvedValueOnce({
                    data: {
                        nomeProduto: "Produto 2",
                        precoProduto: 20.00
                    }
                });
    
            // Act
            const resultado = await pedidoService.calcularTotal(pedidoData);
    
            // Assert
            expect(resultado.total).toBe(80.00); // (2 * 10) + (3 * 20)
            expect(resultado.produtos[0].nomeProduto).toBe("Produto 1");
            expect(resultado.produtos[1].nomeProduto).toBe("Produto 2");
            expect(axios.get).toHaveBeenCalledTimes(2);
        });
    
        it('Deve lançar erro quando produto retorna vazio', async () => {
            // Arrange
            const pedidoData = {
                produtos: [
                    {
                        produto: "produto-1",
                        quantidade: 1
                    }
                ]
            };
    
            // Mock do axios retornando dados vazios
            axios.get.mockResolvedValue({
                data: null
            });
    
            // Act & Assert
            await expect(pedidoService.calcularTotal(pedidoData))
                .rejects
                .toThrow('Produto não encontrado');
    
            expect(axios.get).toHaveBeenCalledTimes(1);
        });
    });

    describe('criarPedido', () => {
        it('Deve criar um pedido com sucesso', async () => {
            // Arrange
            const pedidoData = {
                cliente: "cliente-1",
                produtos: [{
                    produto: "produto-1",
                    quantidade: 2
                }]
            };

            // Mock da resposta do cliente
            axios.get.mockResolvedValueOnce({
                data: {
                    cpf: "123.456.789-00",
                    nomeCliente: "Cliente Teste",
                    email: "teste@teste.com"
                }
            });

            // Mock da resposta do produto
            axios.get.mockResolvedValueOnce({
                data: {
                    nomeProduto: "Produto Teste",
                    precoProduto: 10.00
                }
            });

            mockPedidoRepository.addPedido.mockResolvedValue({
                ...pedidoData,
                pedidoId: "123",
                total: 20.00
            });

            // Act
            const resultado = await pedidoService.criarPedido(pedidoData);

            // Assert
            expect(resultado.pedidoId).toBeDefined();
            expect(resultado.total).toBe(20.00);
            expect(mockPedidoRepository.addPedido).toHaveBeenCalled();
        });

        it('Deve falhar quando cliente não é encontrado', async () => {
            // Arrange
            const pedidoData = {
                cliente: "cliente-inexistente",
                produtos: [{
                    produto: "produto-1",
                    quantidade: 1
                }]
            };

            axios.get.mockRejectedValueOnce({
                response: {
                    status: 404,
                    data: { message: 'Cliente não encontrado' }
                }
            });

            // Act & Assert
            await expect(pedidoService.criarPedido(pedidoData))
                .rejects
                .toThrow('Cliente não encontrado');
        });

        it('Deve falhar quando produtos é um array vazio', async () => {
            // Arrange
            const pedidoData = {
                cliente: "cliente-1",
                produtos: []
            };

            // Mock da resposta do cliente
            axios.get.mockResolvedValueOnce({
                data: {
                    cpf: "123.456.789-00",
                    nomeCliente: "Cliente Teste",
                    email: "teste@teste.com"
                }
            });

            // Act & Assert
            await expect(pedidoService.criarPedido(pedidoData))
                .rejects
                .toThrow('Produtos é obrigatório e deve ser um array não vazio');
        });
    });
});