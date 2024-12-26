const PagamentoService = require('../src/core/user_cases/pagamentoService');
const axios = require('axios');

jest.mock('axios');

describe('Testes do PagamentoService', () => {
    let pagamentoService;
    let mockPedidoRepository;
    let mockPagamentoHttpClient;

    beforeEach(() => {
        mockPedidoRepository = {
            getPedidoByPedidoId: jest.fn(),
            updateStatusPagamento: jest.fn()
        };
        mockPagamentoHttpClient = {
            criarPagamento: jest.fn()
        };
        pagamentoService = new PagamentoService(mockPedidoRepository, mockPagamentoHttpClient);
        jest.clearAllMocks();
    });

    it('Deve lançar erro quando construir produtos com resposta vazia', async () => {
        const produtosPedido = [{
            produto: "produto-1",
            quantidade: 1
        }];

        axios.get.mockResolvedValueOnce({
            data: null
        });

        await expect(pagamentoService._construirProdutos(produtosPedido))
            .rejects
            .toThrow('Produto não encontrado');
    });

    it('Deve lançar erro quando cliente retorna vazio', async () => {
        mockPedidoRepository.getPedidoByPedidoId.mockResolvedValue({
            pedidoId: 'pedido-1',
            cliente: "cliente-1",
            produtos: []
        });

        axios.get.mockResolvedValueOnce({
            data: null
        });

        await expect(pagamentoService.criarPagamento("pedido-1"))
            .rejects
            .toThrow('Cliente não encontrado');
    });

    it('Deve criar pagamento com sucesso', async () => {
        const mockPedido = {
            pedidoId: 'pedido-1',
            cliente: 'cliente-1',
            produtos: [{
                produto: 'produto-1',
                quantidade: 1
            }],
            total: 100.00
        };

        mockPedidoRepository.getPedidoByPedidoId.mockResolvedValue(mockPedido);

        axios.get.mockResolvedValueOnce({
            data: {
                cpf: '123.456.789-00',
                nomeCliente: 'Cliente Teste',
                email: 'teste@teste.com'
            }
        });

        axios.get.mockResolvedValueOnce({
            data: {
                nomeProduto: 'Produto Teste',
                precoProduto: 100.00
            }
        });

        mockPagamentoHttpClient.criarPagamento.mockResolvedValue({
            data: {
                qr_codes: [{
                    links: [{}, { href: 'http://qrcode.test' }]
                }]
            }
        });

        const resultado = await pagamentoService.criarPagamento('pedido-1');

        expect(resultado.pedidoId).toBe('pedido-1');
        expect(resultado.valor).toBe(100.00);
        expect(resultado.status).toBe('Pendente');
        expect(resultado.qrCodeLink).toBe('http://qrcode.test');
    });
});