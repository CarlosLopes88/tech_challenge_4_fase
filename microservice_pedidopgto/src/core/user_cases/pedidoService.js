const Pedido = require('../../core/domain/pedido');
const axios = require('axios');

// Valores obtidos das variáveis de ambiente
const cliente_url_loadbalancer = process.env.CLIENTE_ENDPOINT;
const produto_url_loadbalancer = process.env.PRODUTO_ENDPOINT;

class PedidoService {
    constructor(pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    async calcularTotal(pedidoData) {
        let total = 0;
        for (const item of pedidoData.produtos) {
            // Consulta o produto via API do microserviço Cadastro de Produtos
            const produtoResponse = await axios.get(`http://${produto_url_loadbalancer}/api/produto/${item.produto}`);
            const produto = produtoResponse.data;

            if (produto) {
                item.nomeProduto = produto.nomeProduto;
                item.precoProduto = produto.precoProduto;
                total += item.quantidade * produto.precoProduto;
            } else {
                throw new Error('Produto não encontrado');
            }
        }
        pedidoData.total = total;
        return pedidoData;
    }

    async criarPedido(pedidoData) {
        // Consulta o cliente via API do microserviço Cadastro de Clientes
        const clienteResponse = await axios.get(`http://${cliente_url_loadbalancer}/api/cliente/${pedidoData.cliente}`);
        const cliente = clienteResponse.data;

        if (!cliente) {
            throw new Error('Cliente não encontrado');
        }

        const pedidoCalculado = await this.calcularTotal(pedidoData);
        const pedido = await this.pedidoRepository.addPedido(pedidoCalculado);
        return pedido;
    }
}

module.exports = PedidoService;
