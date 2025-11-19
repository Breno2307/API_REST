const mongoose = require('mongoose');
const User = require('../models/User');

const enviarConflitoEmail = (res) =>
  res.status(409).json({ mensagem: 'Email já está em uso' });

const removerSenha = (usuario) => {
  if (!usuario) return null;
  const objeto = usuario.toObject ? usuario.toObject() : { ...usuario };
  delete objeto.password;
  return objeto;
};

const validarId = (id) => mongoose.Types.ObjectId.isValid(id);

exports.criarUsuario = async (req, res) => {
  try {
    const novoUsuario = await User.create(req.body);
    return res.status(201).json(removerSenha(novoUsuario));
  } catch (error) {
    if (error.code === 11000) {
      return enviarConflitoEmail(res);
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensagem: 'Dados inválidos', erros: error.errors });
    }
    return res.status(500).json({ mensagem: 'Erro ao criar usuário', detalhe: error.message });
  }
};

exports.listarUsuarios = async (req, res) => {
  try {
    const usuarios = await User.find().select('-password');
    return res.status(200).json(usuarios);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao listar usuários', detalhe: error.message });
  }
};

exports.obterUsuario = async (req, res) => {
  const { id } = req.params;

  if (!validarId(id)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }

  try {
    const usuario = await User.findById(id).select('-password');

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    return res.status(200).json(usuario);
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao buscar usuário', detalhe: error.message });
  }
};

exports.atualizarUsuario = async (req, res) => {
  const { id } = req.params;
  const { nome, email, password } = req.body;

  if (!validarId(id)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }

  if (password && password.length < 6) {
    return res
      .status(400)
      .json({ mensagem: 'Senha deve ter pelo menos 6 caracteres' });
  }

  try {
    const usuario = await User.findById(id).select('+password');

    if (!usuario) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    if (typeof nome !== 'undefined') usuario.nome = nome;
    if (typeof email !== 'undefined') usuario.email = email;
    if (typeof password !== 'undefined') usuario.password = password;

    await usuario.save();

    return res.status(200).json(removerSenha(usuario));
  } catch (error) {
    if (error.code === 11000) {
      return enviarConflitoEmail(res);
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ mensagem: 'Dados inválidos', erros: error.errors });
    }
    return res.status(500).json({ mensagem: 'Erro ao atualizar usuário', detalhe: error.message });
  }
};

exports.removerUsuario = async (req, res) => {
  const { id } = req.params;

  if (!validarId(id)) {
    return res.status(400).json({ mensagem: 'ID inválido' });
  }

  try {
    const usuarioRemovido = await User.findByIdAndDelete(id);

    if (!usuarioRemovido) {
      return res.status(404).json({ mensagem: 'Usuário não encontrado' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao remover usuário', detalhe: error.message });
  }
};
