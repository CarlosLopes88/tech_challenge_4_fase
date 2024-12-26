const express = require('express');

module.exports = (pagamentoService) => {
   if (!pagamentoService) {
       throw new Error("pagamentoService é obrigatório para inicializar pagamentoRoutes");
   }

   const router = express.Router();

   router.post('/:pedidoId', async (req, res) => {
    const { pedidoId } = req.params;
    try {
        const pagamento = await pagamentoService.criarPagamento(pedidoId);
        res.status(201).json(pagamento);
    } catch (error) {
        console.error('Erro ao criar pagamento:', error);
        
        if (error.message?.includes('não encontrado') || error.message?.includes('Cliente não encontrado')) {
            return res.status(404).json({ 
                message: error.message,
                error: error.message 
            });
        }

        const statusCode = error.status || 500;
        return res.status(statusCode).json({ 
            message: error.message || "Erro no servidor",
            error: error.message || "Erro interno no servidor" 
        });
    }
    });

   return router;
};