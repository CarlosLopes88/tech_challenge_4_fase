const axios = require('axios');
require('dotenv').config();

class PagamentoHttpClient {
    constructor() {
        this.token = process.env.PAGSEGURO_TOKEN;

        if (!this.token) {
            // Mensagem padronizada com os testes
            throw new Error("Token do PagSeguro não configurado");
        }
    }

    async criarPagamento(requestBody) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': this.token
        };

        try {
            console.log("Enviando requisição para o PagSeguro...");
            const response = await axios.post('https://sandbox.api.pagseguro.com/orders', requestBody, { headers });
            console.log("Resposta da API PagSeguro:", response.data);
            return response;
        } catch (error) {
            if (error.response) {
                console.error("Erro HTTP:", error.response.status);
                console.error("Dados retornados pela API:", JSON.stringify(error.response.data, null, 2));
                // Mensagem padronizada com os testes
                throw new Error(`Erro na API do PagSeguro: ${error.response.status}`);
            } else {
                console.error("Erro na requisição:", error.message);
                // Mantém o erro original para erros de rede
                throw error;
            }
        }
    }
}

module.exports = PagamentoHttpClient;