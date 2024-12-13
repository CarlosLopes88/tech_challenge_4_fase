const Pedido = require('../../core/domain/pedido');
const PedidoRepositoryInterface = require('../../core/repositoriesInterfaces/pedidoRepositoryInterface');

class PedidoRepository extends PedidoRepositoryInterface {
    async addPedido(pedidoData) {
        const pedido = new Pedido(pedidoData);
        await pedido.save();
        return pedido;
    }

    async getPedidoByPedidoId(pedidoId) {
        return Pedido.findOne({ pedidoId });
    }

    async getAllPedidos() {
        return Pedido.find({});
    }

    async getPedidos() {
        return Pedido.find({
            status: { $nin: ["Finalizado"] }  // Exclui pedidos com status "Finalizado"
        })
        .sort({ datapedido: 1 })  // Ordena por data de pedido, mais antigos primeiro
        .sort({ 'status.priority': 1 })  // Ordena por prioridade de status usando um campo de prioridade
        .exec();
    }

    async updatePedidoStatus(pedidoId, novoStatus) {
        const pedidoAtualizado = await Pedido.findOneAndUpdate(
            { pedidoId },
            { status: novoStatus },
            { new: true }
        );
        return pedidoAtualizado;
    }

    async updateStatusPagamento(pedidoId, statusPagamento) {
        const pedidoAtualizado = await Pedido.findOneAndUpdate(
            { pedidoId },
            { statusPagamento: statusPagamento },
            { new: true }
        );
        return pedidoAtualizado;
    }
}

module.exports = PedidoRepository;