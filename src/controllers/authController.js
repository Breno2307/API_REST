const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const gerarToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ mensagem: 'Email e senha são obrigatórios' });
  }

  try {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }

    const senhaValida = await bcrypt.compare(password, user.password);

    if (!senhaValida) {
      return res.status(401).json({ mensagem: 'Credenciais inválidas' });
    }

    const token = gerarToken({ id: user._id });

    return res.status(200).json({
      token,
      usuario: {
        id: user._id,
        nome: user.nome,
        email: user.email,
      },
    });
  } catch (error) {
    return res.status(500).json({ mensagem: 'Erro ao realizar login', detalhe: error.message });
  }
};
