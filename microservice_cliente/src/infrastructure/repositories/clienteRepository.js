// Importa o modelo do Mongoose e a interface do repositório de cliente.
const Cliente = require('../../core/domain/cliente'); // Modelo do Mongoose
const ClienteRepositoryInterface = require('../../core/repositoriesInterfaces/clienteRepositoryInterface');

class ClienteRepository extends ClienteRepositoryInterface {
    /**
     * Adiciona um novo cliente ao repositório.
     * @param {Object} clienteData - Dados do cliente a ser adicionado.
     * @returns {Promise<Object>} O cliente recém-criado.
     */
    async addCliente(clienteData) {
        const cliente = new Cliente(clienteData);
        await cliente.save();
        return cliente;
    }

    /**
     * Busca um cliente pelo seu ID.
     * @param {String} clienteId - O ID do cliente.
     * @returns {Promise<Object>} O cliente encontrado.
     */
    async getClienteByClienteId(clienteId) {
        return Cliente.findOne({ clienteId });
    }

    /**
     * Busca um cliente pelo seu CPF.
     * @param {String} cpf - O CPF do cliente.
     * @returns {Promise<Object>} O cliente encontrado.
     */
    async findClienteByCPF(cpf) {
        return Cliente.findOne({ cpf });
    }

    /**
     * Retorna todos os clientes do repositório.
     * @returns {Promise<Array>} Lista de todos os clientes.
     */
    async getAllClientes() {
        return Cliente.find({});
    }
}

module.exports = ClienteRepository;