const mongoose = require('mongoose');
const shortid = require('shortid');

const produtoSchema = new mongoose.Schema({
    produtoId: { type: String, default: shortid.generate },
    nomeProduto: { type: String, required: true },
    descricaoProduto: { type: String, required: true },
    precoProduto: { type: Number, required: true },
    categoriaProduto: { type: String, required: true }
});

const Produto = mongoose.model('Produto', produtoSchema);

module.exports = Produto;