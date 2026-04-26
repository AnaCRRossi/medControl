const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

const userRoutes = require('./routes/users');
const medicamentoRoutes = require('./routes/medicamentos');
const prescricaoRoutes = require('./routes/prescricoes');
const registroUsoRoutes = require('./routes/registrosUso');
const UserController = require('./controllers/UserController');
const authenticateToken = require('./middlewares/auth');
const authorize = require('./middlewares/authorization');

const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get('/', (req, res) => {
  res.send('MedControl API running');
});

app.use('/api/users', userRoutes);
app.use('/api/medicamentos', medicamentoRoutes);
app.use('/api/prescricoes', prescricaoRoutes);
app.use('/api/registros-uso', registroUsoRoutes);

app.delete('/api/pacientes/:id', authenticateToken, authorize('ADMIN'), (req, res) =>
  UserController.delete(req, res)
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada',
  });
});

app.use(errorHandler);

module.exports = app;
