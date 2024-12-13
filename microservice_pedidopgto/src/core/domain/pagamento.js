const mongoose = require('mongoose');

const pagamentoSchema = new mongoose.Schema({
    pedidoId: { type: String, required: true },
    valor: { type: Number, required: true },
    status: { type: String, default: 'Pendente' },
    qrCodeLink: { type: String, required: true },
    // Outros campos relevantes, como método de pagamento, data de criação, etc.
});

const Pagamento = mongoose.model('Pagamento', pagamentoSchema);

module.exports = Pagamento;