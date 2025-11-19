const Produto = require('../models/Produto');
const mongoose = require('mongoose');

const validarId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.listarProdutos = async (req, res) => {
  try {
    const produtos = await Produto.find();
    return res.status(200).json(produtos);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao listar produtos', detalhe: error.message });
  }
};

exports.obterProduto = async (req, res) => {
  const { id } = req.params;

  if (!validarId(id)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }

  try {
    const produto = await Produto.findById(id);

    if (!produto) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    return res.status(200).json(produto);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar produto', detalhe: error.message });
  }
};

exports.criarProduto = async (req, res) => {
  try {
    const novoProduto = await Produto.create(req.body);
    return res.status(201).json(novoProduto);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensagem: 'Dados inválidos', erros: error.errors });
    }
    return res.status(500).json({ mensagem: 'Erro ao criar produto', detalhe: error.message });
  }
};

exports.atualizarProduto = async (req, res) => {
  const { id } = req.params;

  if (!validarId(id)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }

  try {
    const produtoAtualizado = await Produto.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!produtoAtualizado) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    return res.status(200).json(produtoAtualizado);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensagem: 'Dados inválidos', erros: error.errors });
    }
    return res.status(500).json({ mensagem: 'Erro ao atualizar produto', detalhe: error.message });
  }
};

exports.removerProduto = async (req, res) => {
  const { id } = req.params;

  if (!validarId(id)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }

  try {
    const produtoRemovido = await Produto.findByIdAndDelete(id);

    if (!produtoRemovido) {
      return res.status(404).json({ mensagem: 'Produto não encontrado' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao remover produto', detalhe: error.message });
  }
};
