const axios = require('axios');

// Valores obtidos das variáveis de ambiente
const token = process.env.PAGSEGURO_TOKEN;

if (!token) {
    throw new Error("O token do PagSeguro não foi configurado. Defina a variável de ambiente PAGSEGURO_TOKEN.");
}

class PagamentoHttpClient {
    async criarPagamento(requestBody) {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': token
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
            } else {
                console.error("Erro na requisição:", error.message);
            }
            throw error;
        }
    }
}

module.exports = PagamentoHttpClient;
