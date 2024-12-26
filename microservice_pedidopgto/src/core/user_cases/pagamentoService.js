const axios = require('axios');
require('dotenv').config();

const cliente_url_loadbalancer = process.env.CLIENTE_ENDPOINT;
const produto_url_loadbalancer = process.env.PRODUTO_ENDPOINT;

class PagamentoService {
    constructor(pedidoRepository, pagamentoHttpClient) {
        if (!pedidoRepository || !pagamentoHttpClient) {
            throw new Error('PedidoRepository e PagamentoHttpClient são obrigatórios');
        }
        this.pedidoRepository = pedidoRepository;
        this.pagamentoHttpClient = pagamentoHttpClient;
    }

    async criarPagamento(pedidoId) {
        try {
            const pedido = await this.pedidoRepository.getPedidoByPedidoId(pedidoId);
            if (!pedido) {
                const error = new Error('Pedido não encontrado');
                error.status = 404;
                throw error;
            }

            try {
                const clienteResponse = await axios.get(`http://${cliente_url_loadbalancer}/api/cliente/${pedido.cliente}`);
                const cliente = clienteResponse.data;

                console.log('Cliente recebido da API:', cliente);

                if (!cliente) {
                    const error = new Error('Cliente não encontrado');
                    error.status = 404;
                    throw error;
                }

                const produtos = await this._construirProdutos(pedido.produtos);
                const requestBody = this._construirRequestBody(pedido, cliente, produtos);

                console.log('Payload enviado ao PagSeguro:', requestBody);

                const response = await this.pagamentoHttpClient.criarPagamento(requestBody);
                const qrCodeLink = response.data.qr_codes[0].links[1].href;

                const pagamento = {
                    pedidoId: pedidoId,
                    valor: pedido.total,
                    status: 'Pendente',
                    qrCodeLink: qrCodeLink
                };

                await this.pedidoRepository.updateStatusPagamento(pedidoId, 'Aprovado');
                return pagamento;

            } catch (error) {
                if (error.response?.status === 404) {
                    const newError = new Error('Cliente não encontrado');
                    newError.status = 404;
                    throw newError;
                }
                throw error;
            }
        } catch (error) {
            console.error('Erro ao criar pagamento:', error);
            if (!error.status) {
                error.status = 500;
            }
            throw error;
        }
    }

    async _construirProdutos(produtosPedido) {
        try {
            const produtos = await Promise.all(produtosPedido.map(async (item) => {
                const produtoResponse = await axios.get(`http://${produto_url_loadbalancer}/api/produto/${item.produto}`);
                const produto = produtoResponse.data;
                
                if (!produto) {
                    const error = new Error('Produto não encontrado');
                    error.status = 404;
                    throw error;
                }

                return {
                    name: produto.nomeProduto,
                    quantity: item.quantidade,
                    unit_amount: produto.precoProduto * 100
                };
            }));
            return produtos;
        } catch (error) {
            if (error.response?.status === 404) {
                const newError = new Error('Produto não encontrado');
                newError.status = 404;
                throw newError;
            }
            throw error;
        }
    }

    _construirRequestBody(pedido, cliente, produtos) {
        return {
            reference_id: pedido.pedidoId,
            customer: {
                name: cliente.nomeCliente,
                email: cliente.email,
                tax_id: cliente.cpf,
                phones: [{
                    country: "55",
                    area: "41",
                    number: "999999999",
                    type: "MOBILE"
                }]
            },
            items: produtos,
            qr_codes: [{
                amount: {
                    value: pedido.total * 100
                },
                expiration_date: new Date(Date.now() + 3600 * 1000).toISOString()
            }],
            shipping: {
                address: {
                    street: "meu endereço",
                    number: "0000",
                    complement: "loja 01",
                    locality: "Meu bairro",
                    city: "Curitiba",
                    region_code: "PR",
                    country: "BRA",
                    postal_code: "80000000"
                }
            },
            notification_urls: ["https://meusite.com/notificacoes"]
        };
    }
}

module.exports = PagamentoService;