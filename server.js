require('dotenv').config();
const mongoose = require('mongoose');
const app = require('./src/app');
//const connectDB = require('./src/config/db');
const produtoRoutes = require('./src/routes/produtoRoutes');
const authRoutes = require('./src/routes/authRoutes');
const userRoutes = require('./src/routes/userRoutes');
const agendaRoutes = require('./src/routes/agendaRoutes');
const mongoose = require("mongoose");
const apidocsRouter = require('./src/routes/apidocRouter');

const url = `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_HOST}/${process.env.MONGODB_DATABASE}`;

mongoose.connect(url)
  .then(() => {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
  });
mongoose.connect(url);

// Rotas
app.use('/auth', authRoutes);
app.use('/api/v1/produtos', produtoRoutes);
app.use('/api/v1/usuarios', userRoutes);
app.use('/api-docs', apidocsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
