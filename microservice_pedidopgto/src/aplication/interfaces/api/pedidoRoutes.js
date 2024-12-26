const express = require('express');

module.exports = (pedidoRepository, pedidoService) => {
    if (!pedidoRepository || !pedidoService) {
        throw new Error("pedidoRepository e pedidoService são obrigatórios");
    }

    const router = express.Router();

    // Cria um novo pedido
    router.post('/', async (req, res) => {
        try {
            // Validação básica
            if (!req.body || !req.body.produtos || !Array.isArray(req.body.produtos)) {
                return res.status(400).send({ 
                    message: "Dados inválidos. Produtos é obrigatório e deve ser um array" 
                });
            }

            const novoPedido = await pedidoService.criarPedido(req.body);
            await pedidoRepository.updatePedidoStatus(novoPedido.pedidoId, 'Recebido');
            res.status(201).json(novoPedido);

        } catch (error) {
            if (error.message.includes('não encontrado')) {
                return res.status(404).send({ message: error.message });
            }
            if (error.message.includes('inválido')) {
                return res.status(400).send({ message: error.message });
            }
            console.error('Erro ao criar novo pedido:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    // Busca todos os pedidos
    router.get('/', async (req, res) => {
        try {
            const pedidos = await pedidoRepository.getAllPedidos();
            if (pedidos.length === 0) {
                return res.status(404).send({ message: "Nenhum pedido encontrado." });
            }
            res.json(pedidos);
        } catch (error) {
            console.error('Erro ao buscar todos os pedidos:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    // Nova rota para buscar pedidos com critérios específicos (não finalizados, ordenados etc.)
    router.get('/ativos', async (req, res) => {
        try {
            const pedidos = await pedidoRepository.getPedidos();
            if (pedidos.length === 0) {
                return res.status(404).send({ message: "Nenhum pedido encontrado conforme os critérios." });
            }
            res.json(pedidos);
        } catch (error) {
            console.error('Erro ao buscar pedidos filtrados:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    // Busca um pedido específico pelo pedidoId
    router.get('/:pedidoId', async (req, res) => {
        try {
            const pedido = await pedidoRepository.getPedidoByPedidoId(req.params.pedidoId);
            if (!pedido) {
                return res.status(404).send({ message: "Pedido não encontrado." });
            }
            res.status(200).json(pedido);
        } catch (error) {
            console.error('Erro ao buscar pedido por ID:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    // Atualiza o status de um pedido específico
    router.put('/:pedidoId/status', async (req, res) => {
        try {
            const { pedidoId } = req.params;
            const { novoStatus } = req.body;
    
            if (!novoStatus) {
                return res.status(400).send({ message: "Dados inválidos. novoStatus é obrigatório" });
            }
    
            const pedidoAtualizado = await pedidoRepository.updatePedidoStatus(pedidoId, novoStatus);
            if (!pedidoAtualizado) {
                return res.status(404).send({ message: "Pedido não encontrado." });
            }
    
            res.status(200).json(pedidoAtualizado);
        } catch (error) {
            console.error('Erro ao atualizar status do pedido:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    return router;
};
