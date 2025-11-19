const mongoose = require('mongoose');

const positivoValidator = (campo) => ({
  validator: (valor) => typeof valor === 'number' && Number.isFinite(valor) && valor > 0,
  message: `${campo} deve ser um número positivo`,
});

const ProdutoSchema = new mongoose.Schema(
  {
    nome: {
      type: String,
      required: [true, 'Nome é obrigatório'],
      trim: true,
    },
    preco: {
      type: Number,
      required: [true, 'Preço é obrigatório'],
      ...positivoValidator('Preço'),
    },
    quantidade: {
      type: Number,
      required: [true, 'Quantidade é obrigatória'],
      ...positivoValidator('Quantidade'),
    },
    categoria: {
      type: String,
      required: [true, 'Categoria é obrigatória'],
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Produto', ProdutoSchema);
