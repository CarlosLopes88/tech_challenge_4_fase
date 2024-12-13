const axios = require('axios');

// Valores obtidos das variáveis de ambiente
const cliente_url_loadbalancer = process.env.CLIENTE_ENDPOINT;
const produto_url_loadbalancer = process.env.PRODUTO_ENDPOINT;

class PagamentoService {
    constructor(pedidoRepository, pagamentoHttpClient) {
        this.pedidoRepository = pedidoRepository;
        this.pagamentoHttpClient = pagamentoHttpClient;
    }

    async criarPagamento(pedidoId) {
        try {
            // Buscar o pedido pelo ID
            const pedido = await this.pedidoRepository.getPedidoByPedidoId(pedidoId);
            if (!pedido) {
                throw new Error('Pedido não encontrado');
            }

            // Buscar o cliente via API
            const clienteResponse = await axios.get(`http://${cliente_url_loadbalancer}/api/cliente/${pedido.cliente}`);
            const cliente = clienteResponse.data;

            console.log('Cliente recebido da API:', cliente);

            if (!cliente) {
                throw new Error('Cliente não encontrado');
            }

            // Preparar os produtos
            const produtos = await this._construirProdutos(pedido.produtos);

            // Construir o corpo da requisição
            const requestBody = this._construirRequestBody(pedido, cliente, produtos);

            console.log('Payload enviado ao PagSeguro:', requestBody);

            // Realizar a chamada ao PagSeguro
            const response = await this.pagamentoHttpClient.criarPagamento(requestBody);
            const qrCodeLink = response.data.qr_codes[0].links[1].href;

            // Registrar o pagamento
            const pagamento = {
                pedidoId: pedidoId,
                valor: pedido.total,
                status: 'Pendente',
                qrCodeLink: qrCodeLink
            };

            await this.pedidoRepository.updateStatusPagamento(pedidoId, 'Aprovado');
            return pagamento;

        } catch (error) {
            console.error('Erro ao criar pagamento:', error);
            throw new Error(error.message);
        }
    }

    async _construirProdutos(produtosPedido) {
        const produtos = await Promise.all(produtosPedido.map(async (item) => {
            // Buscar produto via API
            const produtoResponse = await axios.get(`http://${produto_url_loadbalancer}/api/produto/${item.produto}`);
            const produto = produtoResponse.data;
            
            return {
                name: produto.nomeProduto,
                quantity: item.quantidade,
                unit_amount: produto.precoProduto * 100
            };
        }));
        return produtos;
    }

    _construirRequestBody(pedido, cliente, produtos) {
        return {
            reference_id: pedido.pedidoId,
            customer: {
                name: cliente.nomeCliente,
                email: cliente.email,
                tax_id: cliente.cpf,
                phones: [
                    {
                        country: "55",
                        area: "41",
                        number: "999999999",
                        type: "MOBILE"
                    }
                ]
            },
            items: produtos,
            qr_codes: [
                {
                    amount: {
                        value: pedido.total * 100
                    },
                    expiration_date: new Date(Date.now() + 3600 * 1000).toISOString()
                }
            ],
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
            notification_urls: [
                "https://meusite.com/notificacoes"
            ]
        };
    }
}

module.exports = PagamentoService;