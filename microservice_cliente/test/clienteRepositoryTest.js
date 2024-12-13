const mongoose = require('mongoose');
const Cliente = require('../src/core/domain/cliente');
const ClienteRepository = require('../src/infrastructure/repositories/clienteRepository');

describe('Testes do ClienteRepository', () => {
  let clienteRepository;

  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    clienteRepository = new ClienteRepository();
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('Deve adicionar um novo cliente', async () => {
    const cliente = await clienteRepository.addCliente({
      cpf: '123.456.789-09',
      nomeCliente: 'Teste Silva',
      email: 'teste@example.com',
    });

    expect(cliente.clienteId).toBeDefined();
    expect(cliente.nomeCliente).toBe('Teste Silva');
  });

  it('Deve retornar todos os clientes', async () => {
    const clientes = await clienteRepository.getAllClientes();

    expect(clientes.length).toBeGreaterThan(0);
  });
});
