const { connectToDatabase, disconnectDatabase, clearDatabase } = require('./testDbConnect');
const PagamentoHttpClient = require('../src/infrastructure/http/pagamentoHttpClient');
const axios = require('axios');

describe('Testes do PagamentoHttpClient', () => {
    let pagamentoHttpClient;
    let db_test;
    const originalEnv = process.env;

    beforeAll(async () => {
        db_test = await connectToDatabase();
        process.env.PAGSEGURO_TOKEN = 'Bearer test-token';
        pagamentoHttpClient = new PagamentoHttpClient();
    }, 30000);

    afterAll(async () => {
        await disconnectDatabase();
        process.env = originalEnv;
    });

    beforeEach(async () => {
        await clearDatabase();
        jest.clearAllMocks();
        jest.spyOn(axios, 'post');
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it('Deve criar um pagamento no PagSeguro', async () => {
        const mockResponse = {
            data: {
                id: 'PAYMENT-123',
                qr_codes: [
                    {
                        links: [
                            {},
                            { href: 'http://qrcode.test' }
                        ]
                    }
                ]
            }
        };

        axios.post.mockResolvedValue(mockResponse);

        const requestBody = {
            reference_id: '12345',
            customer: {
                name: 'Cliente Teste',
                email: 'teste@teste.com',
                tax_id: '11122233344'
            },
            items: [
                {
                    name: 'Produto Teste',
                    quantity: 1,
                    unit_amount: 1000
                }
            ],
            qr_codes: [
                {
                    amount: {
                        value: 1000
                    }
                }
            ]
        };

        const result = await pagamentoHttpClient.criarPagamento(requestBody);
        
        expect(result.data.id).toBe('PAYMENT-123');
        expect(result.data.qr_codes[0].links[1].href).toBe('http://qrcode.test');
        expect(axios.post).toHaveBeenCalledWith(
            'https://sandbox.api.pagseguro.com/orders',
            requestBody,
            expect.objectContaining({
                headers: expect.objectContaining({
                    'Authorization': 'Bearer test-token'
                })
            })
        );
    });

    it('Deve lidar com erros da API do PagSeguro', async () => {
        const errorResponse = {
            response: {
                status: 400,
                data: { error_messages: ['Bad Request'] }
            }
        };

        axios.post.mockRejectedValue(errorResponse);

        await expect(async () => {
            await pagamentoHttpClient.criarPagamento({});
        }).rejects.toThrow();
    });

    it('Deve lidar com erros de rede', async () => {
        const networkError = new Error('Network Error');
        axios.post.mockRejectedValue(networkError);

        await expect(pagamentoHttpClient.criarPagamento({}))
            .rejects
            .toThrow('Network Error');
    });

    it('Deve validar o token do PagSeguro', () => {
        const token = process.env.PAGSEGURO_TOKEN;
        delete process.env.PAGSEGURO_TOKEN;
        
        expect(() => {
            new PagamentoHttpClient();
        }).toThrow('Token do PagSeguro não configurado');
        
        process.env.PAGSEGURO_TOKEN = token;
    });

    it('Deve retornar erro com status correto para erro do PagSeguro', async () => {
        const errorResponse = {
            response: {
                status: 422,
                data: { 
                    error_messages: ['Invalid payment data']
                }
            }
        };

        axios.post.mockRejectedValue(errorResponse);
        const consoleSpy = jest.spyOn(console, 'error');

        await expect(pagamentoHttpClient.criarPagamento({}))
            .rejects
            .toThrow();

        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});