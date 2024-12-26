const express = require('express');

module.exports = (produtoRepository) => {
    if (!produtoRepository) {
        throw new Error("produtoRepository é obrigatório para inicializar produtoRoutes");
    }

    const router = express.Router();


    // Validação dos dados do produto
    const validateProduto = (produto) => {
        const errors = [];
        if (!produto.nomeProduto) errors.push('Nome do produto é obrigatório');
        if (!produto.descricaoProduto) errors.push('Descrição do produto é obrigatória');
        if (!produto.precoProduto || produto.precoProduto <= 0) errors.push('Preço do produto deve ser maior que zero');
        if (!produto.categoriaProduto) errors.push('Categoria do produto é obrigatória');
        return errors;
    };

    router.post('/', async (req, res) => {
        try {
            let produtos = Array.isArray(req.body) ? req.body : [req.body];

            // Validação inicial
            if (!produtos || produtos.length === 0) {
                return res.status(400).send({ message: "Dados do produto são obrigatórios" });
            }

            // Valida cada produto
            for (const produto of produtos) {
                const errors = validateProduto(produto);
                if (errors.length > 0) {
                    return res.status(400).send({ message: "Dados inválidos", errors });
                }
            }

            // Verifica nomes duplicados
            const nomes = produtos.map(p => p.nomeProduto);
            if (new Set(nomes).size !== nomes.length) {
                return res.status(400).send({ message: "Produtos não podem possuir o mesmo nome." });
            }

            const novosProdutos = [];
            try {
                for (const produto of produtos) {
                    const novoProduto = await produtoRepository.addProduto(produto);
                    novosProdutos.push(novoProduto);
                }
            } catch (error) {
                if (error.message.includes('já existe')) {
                    return res.status(400).send({ message: "Produtos não podem possuir o mesmo nome." });
                }
                throw error;
            }

            res.status(201).json(produtos.length === 1 ? novosProdutos[0] : novosProdutos);
        } catch (error) {
            console.error('Erro ao adicionar produtos:', error);
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
