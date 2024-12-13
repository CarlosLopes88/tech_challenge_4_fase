const express = require('express');

module.exports = (pagamentoService) => {
    if (!pagamentoService) {
        throw new Error("pagamentoService é obrigatório para inicializar pagamentoRoutes");
    }

    const router = express.Router();

    // Rota para criar pagamento
    router.post('/:pedidoId', async (req, res) => {
        const { pedidoId } = req.params;
        try {
            const pagamento = await pagamentoService.criarPagamento(pedidoId);
            res.status(201).json(pagamento);
        } catch (error) {
            console.error('Erro ao criar pagamento:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    return router;
};
