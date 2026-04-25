const express = require('express');
const UserController = require('../controllers/UserController');
const authenticateToken = require('../middlewares/auth');
const authorize = require('../middlewares/authorization');

const router = express.Router();

// Rotas públicas
router.post('/register', (req, res) => UserController.register(req, res));
router.post('/login', (req, res) => UserController.login(req, res));

// Rotas protegidas
router.get('/profile', authenticateToken, (req, res) => UserController.getProfile(req, res));

// Apenas ADMIN
router.get('/', authenticateToken, authorize('ADMIN'), (req, res) =>
  UserController.getAll(req, res)
);

router.put(
  '/:id',
  authenticateToken,
  authorize('ADMIN'),
  (req, res) => UserController.update(req, res)
);

router.delete(
  '/:id',
  authenticateToken,
  authorize('ADMIN'),
  (req, res) => UserController.delete(req, res)
);

module.exports = router;
