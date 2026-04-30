const express = require('express');
const { swaggerUi, specs } = require('./config/swagger');
const errorHandler = require('./middlewares/errorHandler');

const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/users');
const medicamentoRoutes = require('./routes/medicamentos');
const prescricaoRoutes = require('./routes/prescricoes');
const registroUsoRoutes = require('./routes/registrosUso');
const UserController = require('./controllers/UserController');
const authMiddleware = require('./middlewares/auth.middleware');
const roleMiddleware = require('./middlewares/role.middleware');

const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

app.get('/', (req, res) => {
  res.send('MedControl API running');
});

app.use('/auth', authRoutes);
app.use('/api/users', authMiddleware, userRoutes);
app.use('/api/medicamentos', authMiddleware, medicamentoRoutes);
app.use('/api/prescricoes', authMiddleware, prescricaoRoutes);
app.use('/api/registros-uso', authMiddleware, registroUsoRoutes);

app.post('/api/pacientes', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  UserController.register(req, res)
);
app.get('/api/pacientes', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
  UserController.getAll(req, res)
);
app.delete('/api/pacientes/:id', authMiddleware, roleMiddleware(['ADMIN']), (req, res) =>
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
