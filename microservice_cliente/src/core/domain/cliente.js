const mongoose = require('mongoose');
const shortid = require('shortid'); // Certifique-se de que shortid está instalado e importado corretamente

const clienteSchema = new mongoose.Schema({
    clienteId: { type: String, default: shortid.generate }, // ID personalizado
    cpf: { type: String, required: false },
    nomeCliente: { type: String, required: false }, // Nome do cliente
    email: { type: String, required: false }, // Email do cliente
    registrado: { type: Boolean, default: false }, // Se está registrado
    dataRegistro: { type: Date, default: Date.now } // UM único campo de data
});

const Cliente = mongoose.model('Cliente', clienteSchema);

module.exports = Cliente;