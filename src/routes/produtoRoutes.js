const express = require('express');
const {
  listarProdutos,
  obterProduto,
  criarProduto,
  atualizarProduto,
  removerProduto,
} = require('../controllers/produtoController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', listarProdutos);
router.get('/:id', obterProduto);
router.post('/', authMiddleware, criarProduto);
router.put('/:id', authMiddleware, atualizarProduto);
router.delete('/:id', authMiddleware, removerProduto);

module.exports = router;
