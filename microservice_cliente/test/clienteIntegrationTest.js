const request = require('supertest');
const app = require('../src/application/interfaces/web/server');
const mongoose = require('mongoose');

describe('Testes de integração do microserviço de clientes', () => {
  beforeAll(async () => {
    await mongoose.connect('mongodb://localhost:27017/test', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it('Deve criar e buscar um cliente por ID', async () => {
    const novoCliente = {
      cpf: '123.456.789-09',
      nomeCliente: 'Cliente Integração',
      email: 'integracao@example.com',
    };

    const resPost = await request(app).post('/api/cliente').send(novoCliente);
    expect(resPost.status).toBe(201);

    const resGet = await request(app).get(`/api/cliente/${resPost.body.clienteId}`);
    expect(resGet.status).toBe(200);
    expect(resGet.body.nomeCliente).toBe('Cliente Integração');
  });
});
