const express = require('express');
const router = express.Router();
const eventoController = require('../controllers/eventoController');


const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, eventoController.listarEventos);
router.get('/:id', authMiddleware, eventoController.detalhesEvento);
router.post('/', authMiddleware, eventoController.criarEvento);
router.put('/:id', authMiddleware, eventoController.atualizarEvento);
router.delete('/:id', authMiddleware, eventoController.deletarEvento);

module.exports = router;