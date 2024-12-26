const Cliente = require('../src/core/domain/cliente');
const ClienteRepository = require('../src/infrastructure/repositories/clienteRepository');
const { connectToDatabase, disconnectDatabase, clearDatabase } = require('./testDbConnect');

describe('Testes do ClienteRepository', () => {
    let clienteRepository;
    let db_test;

    beforeAll(async () => {
        db_test = await connectToDatabase();
        clienteRepository = new ClienteRepository();
    }, 30000);

    afterAll(async () => {
        await disconnectDatabase();
    });

    beforeEach(async () => {
        await clearDatabase();
    });

    it('Deve adicionar um novo cliente', async () => {
        const cliente = await clienteRepository.addCliente({
            cpf: '123.456.789-09',
            nomeCliente: 'Teste Silva',
            email: 'teste@example.com',
        });

        expect(cliente.clienteId).toBeDefined();
        expect(cliente.nomeCliente).toBe('Teste Silva');
        expect(cliente.cpf).toBe('123.456.789-09');
        expect(cliente.email).toBe('teste@example.com');
    });

    it('Deve buscar cliente por CPF', async () => {
        const novoCliente = {
            cpf: '987.654.321-00',
            nomeCliente: 'Teste CPF',
            email: 'teste.cpf@example.com',
        };

        await clienteRepository.addCliente(novoCliente);
        const cliente = await clienteRepository.findClienteByCPF('987.654.321-00');

        expect(cliente).toBeDefined();
        expect(cliente.nomeCliente).toBe('Teste CPF');
    });

    it('Deve retornar null para CPF não encontrado', async () => {
        const cliente = await clienteRepository.findClienteByCPF('111.111.111-11');
        expect(cliente).toBeNull();
    });

    it('Deve retornar lista vazia quando não há clientes', async () => {
        const clientes = await clienteRepository.getAllClientes();
        expect(Array.isArray(clientes)).toBe(true);
        expect(clientes).toHaveLength(0);
    });

    it('Deve retornar todos os clientes cadastrados', async () => {
        const clientes = [
            {
                cpf: '111.111.111-11',
                nomeCliente: 'Cliente 1',
                email: 'cliente1@example.com',
            },
            {
                cpf: '222.222.222-22',
                nomeCliente: 'Cliente 2',
                email: 'cliente2@example.com',
            }
        ];

        for (const cliente of clientes) {
            await clienteRepository.addCliente(cliente);
        }

        const clientesRetornados = await clienteRepository.getAllClientes();
        expect(clientesRetornados).toHaveLength(2);
        expect(clientesRetornados[0].nomeCliente).toBe('Cliente 1');
        expect(clientesRetornados[1].nomeCliente).toBe('Cliente 2');
    });

    it('Deve buscar cliente por ID', async () => {
        const novoCliente = await clienteRepository.addCliente({
            cpf: '333.333.333-33',
            nomeCliente: 'Cliente Busca ID',
            email: 'cliente.id@example.com',
        });

        const clienteEncontrado = await clienteRepository.getClienteByClienteId(novoCliente.clienteId);
        expect(clienteEncontrado).toBeDefined();
        expect(clienteEncontrado.nomeCliente).toBe('Cliente Busca ID');
    });
});