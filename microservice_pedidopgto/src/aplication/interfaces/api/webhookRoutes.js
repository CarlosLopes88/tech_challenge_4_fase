const express = require('express');

module.exports = (pedidoRepository) => {
    if (!pedidoRepository) {
        throw new Error("pedidoRepository é obrigatório para inicializar webhookRoutes");
    }

    const router = express.Router();

    // Endpoint para receber notificações do PagSeguro
    router.post('/pagseguro', async (req, res) => {
        const notification = req.body;
        console.log('Notificação do PagSeguro recebida:', notification);

        try {
            // Verifique o tipo de evento e processe conforme necessário
            if (notification.event === 'transaction') {
                const transaction = notification.data;
                const pedidoId = transaction.reference_id; // Assumindo que o ID do pedido foi usado como referência

                // Atualizar apenas o status do pagamento
                const statusPagamento = transaction.status === 'PAID' ? 'Aprovado' : transaction.status;

                // Atualize apenas o status do pagamento no seu sistema
                await pedidoRepository.updateStatusPagamento(pedidoId, statusPagamento);

                console.log(`Pedido ${pedidoId} atualizado para status ${statusPagamento}`);
            }

            // Responder à requisição do webhook
            res.status(200).send('Notificação recebida');
        } catch (error) {
            console.error('Erro ao processar notificação do PagSeguro:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    return router;
};
