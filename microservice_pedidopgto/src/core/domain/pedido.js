const mongoose = require('mongoose');
const shortid = require('shortid');

const pedidoSchema = new mongoose.Schema({
    pedidoId: { type: String, default: shortid.generate },
    cliente: {
        type: String,
        required: false
    },
    produtos: [{
        produto: {
            type: String,
            required: true
        },
        nomeProduto: { type: String, required: true },
        precoProduto: { type: Number, required: true },
        quantidade: { type: Number, required: true, default: 1 }
    }],
    total: { type: Number, required: true, default: 0 },
    status: { type: String, required: true, default: 'Recebido' },
    datapedido: { type: Date, default: Date.now },
    statusPagamento: { type: String, default: 'Pendente' },
    pagamentoId: { type: String, required: false },
});

const Pedido = mongoose.model('Pedido', pedidoSchema);

module.exports = Pedido;