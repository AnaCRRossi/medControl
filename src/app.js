const express = require('express');
const errorHandler = require('./middlewares/errorHandler');

// Importar rotas
const userRoutes = require('./routes/users');
const medicamentoRoutes = require('./routes/medicamentos');
const prescricaoRoutes = require('./routes/prescricoes');
const registroUsoRoutes = require('./routes/registrosUso');

const app = express();

// Middlewares de parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API MedControl está funcionando',
    timestamp: new Date().toISOString(),
  });
});

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/prescricoes', prescricaoRoutes);
app.use('/api/registros-uso', registroUsoRoutes);

// Rota 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  });
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

module.exports = app;
