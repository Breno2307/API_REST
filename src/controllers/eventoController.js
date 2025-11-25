const Evento = require('../models/Evento');

exports.listarEventos = async (req, res) => {
  try {
    const eventos = await Evento.find();
    res.status(200).json(eventos);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar eventos.' });
  }
};

exports.detalhesEvento = async (req, res) => {
  try {
    const evento = await Evento.findById(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado.' });
    }
    res.status(200).json(evento);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar detalhes do evento.' });
  }
};

exports.criarEvento = async (req, res) => {
  try {
    const novoEvento = await Evento.create(req.body);
    res.status(201).json(novoEvento);
  } catch (error) {
    // Retorna 400 se houver erro de validação (ex: datas inválidas)
    res.status(400).json({ error: error.message });
  }
};

exports.atualizarEvento = async (req, res) => {
  try {
    // new: true retorna o objeto atualizado
    // runValidators: true força a validação do Schema na atualização
    const evento = await Evento.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado para atualização.' });
    }
    res.status(200).json(evento);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deletarEvento = async (req, res) => {
  try {
    const evento = await Evento.findByIdAndDelete(req.params.id);
    if (!evento) {
      return res.status(404).json({ error: 'Evento não encontrado para remoção.' });
    }
    res.status(204).send(); 
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar evento.' });
  }
};