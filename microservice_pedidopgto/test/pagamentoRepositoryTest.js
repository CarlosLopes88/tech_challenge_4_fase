const mongoose = require('mongoose');
const Pagamento = require('../src/core/domain/pagamento');
const PagamentoHttpClient = require('../src/infrastructure/http/pagamentoHttpClient');

describe('Testes do PagamentoHttpClient', () => {
    let pagamentoHttpClient;

    beforeAll(() => {
        pagamentoHttpClient = new PagamentoHttpClient();
    });

    it('Deve criar um novo pagamento via API', async () => {
        jest.spyOn(pagamentoHttpClient, 'criarPagamento').mockResolvedValue({
            data: {
                qr_codes: [{ links: [{}, { href: 'http://example.com/qrcode' }] }]
            }
        });

        const requestBody = {
            reference_id: '67890',
            customer: { name: 'Teste Cliente', email: 'teste@example.com' },
            items: [],
        };

        const response = await pagamentoHttpClient.criarPagamento(requestBody);
        expect(response.data.qr_codes[0].links[1].href).toBe('http://example.com/qrcode');
    });
});
