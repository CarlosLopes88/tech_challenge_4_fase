const mongoose = require('mongoose');
const Pedido = require('../src/core/domain/pedido');
const PedidoRepository = require('../src/infrastructure/repositories/pedidoRepository');

describe('Testes do PedidoRepository', () => {
    let pedidoRepository;

    beforeAll(async () => {
        await mongoose.connect('mongodb://localhost:27017/test', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        pedidoRepository = new PedidoRepository();
    });

    afterAll(async () => {
        await mongoose.connection.dropDatabase();
        await mongoose.connection.close();
    });

    it('Deve adicionar um novo pedido', async () => {
        const pedido = await pedidoRepository.addPedido({
            cliente: '12345',
            produtos: [{ produto: '23456', quantidade: 2 }]
        });

        expect(pedido.pedidoId).toBeDefined();
        expect(pedido.cliente).toBe('12345');
    });

    it('Deve retornar todos os pedidos', async () => {
        const pedidos = await pedidoRepository.getAllPedidos();
        expect(pedidos.length).toBeGreaterThan(0);
    });
});
