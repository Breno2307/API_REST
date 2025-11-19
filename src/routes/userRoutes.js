const express = require('express');
const {
  criarUsuario,
  listarUsuarios,
  obterUsuario,
  atualizarUsuario,
  removerUsuario,
} = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', criarUsuario);
router.get('/', authMiddleware, listarUsuarios);
router.get('/:id', authMiddleware, obterUsuario);
router.put('/:id', authMiddleware, atualizarUsuario);
router.delete('/:id', authMiddleware, removerUsuario);

module.exports = router;
