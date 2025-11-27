const express = require('express');
const cors = require('cors');

const produtoRoutes = require('./routes/produtoRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const agendaRoutes = require('./routes/agendaRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/v1/produtos', produtoRoutes);
app.use('/api/v1/usuarios', userRoutes);
app.use('/api/v1/agenda', agendaRoutes);

module.exports = app;
