const request = require('supertest');
const app = require('../src/application/interfaces/web/server');
const ClienteRepository = require('../src/infrastructure/repositories/clienteRepository');

jest.mock('../src/infrastructure/repositories/clienteRepository');

describe('Testes das rotas de Cliente', () => {
  beforeEach(() => {
    ClienteRepository.mockClear();
  });

  it('Deve criar um novo cliente', async () => {
    ClienteRepository.prototype.addCliente.mockResolvedValue({
      clienteId: '12345',
      cpf: '123.456.789-09',
      nomeCliente: 'Teste Silva',
      email: 'teste@example.com',
    });

    const res = await request(app).post('/api/cliente').send({
      cpf: '123.456.789-09',
      nomeCliente: 'Teste Silva',
      email: 'teste@example.com',
    });

    expect(res.status).toBe(201);
    expect(res.body.clienteId).toBe('12345');
  });

  it('Deve retornar todos os clientes', async () => {
    ClienteRepository.prototype.getAllClientes.mockResolvedValue([
      { clienteId: '12345', nomeCliente: 'Cliente 1' },
      { clienteId: '67890', nomeCliente: 'Cliente 2' },
    ]);

    const res = await request(app).get('/api/cliente');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
  });

  it('Deve retornar erro ao criar cliente sem dados obrigatórios', async () => {
    const res = await request(app).post('/api/cliente').send({});

    expect(res.status).toBe(400);
  });
});
