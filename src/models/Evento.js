const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: [true, 'O título do evento é obrigatório'],
        trim: true
    },
    dataInicio: {
        type: Date,
        required: [true, 'A data de início é obrigatória']
    },
    dataFim: {
        type: Date,
        required: [true, 'A data de fim é obrigatória'],
        // Validação personalizada
        validate: {
            validator: function (value) {
                // 'this' refere-se ao documento sendo salvo
                return this.dataInicio <= value;
            },
            message: 'A data de fim deve ser posterior ou igual à data de início.'
        }
    },
    local: {
        type: String
    },
    participantes: [{
        type: String, 
        trim: true
    }],
    descricao: {
        type: String,
        trim: true
    },
    criadoEm: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Evento', eventoSchema);