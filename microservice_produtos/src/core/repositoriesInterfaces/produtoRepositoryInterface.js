class ProdutoRepositoryInterface {
    /**
     * Adiciona um novo produto ao repositório.
     * @param {Object} produtoData - Dados do produto a ser adicionado.
     * @returns {Promise<Object>} O produto recém-criado.
     */
    async addProduto(produtoData) {
        throw new Error('Method not implemented: addProduto');
    }

    /**
     * Busca um produto pelo seu ID.
     * @param {String} produtoId - O ID do produto.
     * @returns {Promise<Object>} O produto encontrado.
     */
    async getProdutoByProdutoId(produtoId) {
        throw new Error('Method not implemented: getProdutoByProdutoId');
    }

    /**
     * Retorna todos os produtos do repositório.
     * @returns {Promise<Array>} Lista de todos os produtos.
     */
    async getAllProdutos() {
        throw new Error('Method not implemented: getAllProdutos');
    }

    /**
     * Retorna produtos de uma categoria específica.
     * @param {String} categoria - A categoria dos produtos.
     * @returns {Promise<Array>} Lista de produtos da categoria.
     */
    async getProdutosByCategoria(categoria) {
        throw new Error('Method not implemented: getProdutosByCategoria');
    }

    /**
     * Atualiza um produto pelo ID.
     * @param {String} produtoId - O ID do produto.
     * @param {Object} updateData - Dados para atualização do produto.
     * @returns {Promise<Object>} O produto atualizado.
     */
    async updateProduto(produtoId, updateData) {
        throw new Error('Method not implemented: updateProduto');
    }

    /**
     * Exclui um produto pelo ID.
     * @param {String} produtoId - O ID do produto.
     * @returns {Promise<Object>} O produto excluído.
     */
    async deleteProduto(produtoId) {
        throw new Error('Method not implemented: deleteProduto');
    }
}

module.exports = ProdutoRepositoryInterface;