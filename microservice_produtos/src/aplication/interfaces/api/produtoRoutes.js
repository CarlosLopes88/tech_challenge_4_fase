const express = require('express');

module.exports = (produtoRepository) => {
    if (!produtoRepository) {
        throw new Error("produtoRepository é obrigatório para inicializar produtoRoutes");
    }

    const router = express.Router();

    router.post('/', async (req, res) => {
        let produtos = req.body;

        // Verifica se a entrada é um único objeto e transforma em array
        if (!Array.isArray(produtos)) {
            produtos = [produtos];
        }

        try {
            // Valida se todos os produtos possuem nomes únicos
            const nomesProdutos = produtos.map(produto => produto.nomeProduto);
            const nomesUnicos = new Set(nomesProdutos);
            if (nomesProdutos.length !== nomesUnicos.size) {
                return res.status(400).send({ message: "Produtos não podem possuir o mesmo nome." });
            }

            // Adiciona cada produto ao repositório
            const novosProdutos = [];
            for (const produto of produtos) {
                const novoProduto = await produtoRepository.addProduto(produto);
                novosProdutos.push(novoProduto);
            }

            res.status(201).json(novosProdutos);
        } catch (error) {
            console.error('Erro ao adicionar novos produtos:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    router.get('/', async (req, res) => {
        try {
            const produtos = await produtoRepository.getAllProdutos();
            if (produtos.length === 0) {
                return res.status(404).send({ message: "Nenhum produto encontrado." });
            }
            res.json(produtos);
        } catch (error) {
            console.error('Erro ao buscar todos os produtos:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    router.get('/:produtoId', async (req, res) => {
        try {
            const produto = await produtoRepository.getProdutoByProdutoId(req.params.produtoId);
            if (!produto) {
                return res.status(404).send({ message: "Produto não encontrado." });
            }
            res.status(200).json(produto);
        } catch (error) {
            console.error('Erro ao buscar produto por ID:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    router.get('/categoria/:categoria', async (req, res) => {
        try {
            const produtos = await produtoRepository.getProdutosByCategoria(req.params.categoria);
            if (produtos.length === 0) {
                return res.status(404).send({ message: "Nenhum produto encontrado nesta categoria." });
            }
            res.json(produtos);
        } catch (error) {
            console.error('Erro ao buscar produtos por categoria:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    router.put('/:produtoId', async (req, res) => {
        try {
            // Verifica se o produto existe
            const existingProduct = await produtoRepository.getProdutoByProdutoId(req.params.produtoId);
            if (!existingProduct) {
                return res.status(404).send({ message: "Produto não encontrado." });
            }

            // Atualiza o produto
            const updatedProduct = await produtoRepository.updateProduto(req.params.produtoId, req.body);
            res.status(200).json(updatedProduct);
        } catch (error) {
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    router.delete('/:produtoId', async (req, res) => {
        try {
            const result = await produtoRepository.deleteProduto(req.params.produtoId);
            if (!result) {
                return res.status(404).send({ message: "Produto não encontrado." });
            }
            res.status(200).send({ message: "Produto excluído com sucesso." });
        } catch (error) {
            console.error('Erro ao excluir produto:', error);
            res.status(500).send({ message: "Erro no servidor", error: error.message });
        }
    });

    return router;
};
