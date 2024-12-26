const Pedido = require('../../core/domain/pedido');
const axios = require('axios');
require('dotenv').config();

const cliente_url_loadbalancer = process.env.CLIENTE_ENDPOINT;
const produto_url_loadbalancer = process.env.PRODUTO_ENDPOINT;

class PedidoService {
    constructor(pedidoRepository) {
        if (!pedidoRepository) {
            throw new Error("PedidoRepository é obrigatório");
        }
        this.pedidoRepository = pedidoRepository;
    }

    async calcularTotal(pedidoData) {
        let total = 0;
        try {
            for (const item of pedidoData.produtos) {
                const produtoResponse = await axios.get(`http://${produto_url_loadbalancer}/api/produto/${item.produto}`);
                const produto = produtoResponse.data;

                if (!produto) {
                    const error = new Error('Produto não encontrado');
                    error.status = 404;
                    throw error;
                }

                item.nomeProduto = produto.nomeProduto;
                item.precoProduto = produto.precoProduto;
                total += item.quantidade * produto.precoProduto;
            }
            pedidoData.total = total;
            return pedidoData;
        } catch (error) {
            if (error.response?.status === 404) {
                const newError = new Error('Produto não encontrado');
                newError.status = 404;
                throw newError;
            }
            throw error;
        }
    }

    async criarPedido(pedidoData) {
        try {
            const clienteResponse = await axios.get(`http://${cliente_url_loadbalancer}/api/cliente/${pedidoData.cliente}`);
            const cliente = clienteResponse.data;

            if (!cliente) {
                const error = new Error('Cliente não encontrado');
                error.status = 404;
                throw error;
            }

            if (!pedidoData.produtos || !Array.isArray(pedidoData.produtos) || pedidoData.produtos.length === 0) {
                const error = new Error('Produtos é obrigatório e deve ser um array não vazio');
                error.status = 400;
                throw error;
            }

            const pedidoCalculado = await this.calcularTotal(pedidoData);
            const pedido = await this.pedidoRepository.addPedido(pedidoCalculado);
            return pedido;
        } catch (error) {
            if (error.response?.status === 404) {
                const newError = new Error('Cliente não encontrado');
                newError.status = 404;
                throw newError;
            }
            if (error.status) {
                throw error;
            }
            const serverError = new Error(error.message);
            serverError.status = 500;
            throw serverError;
        }
    }
}

module.exports = PedidoService;