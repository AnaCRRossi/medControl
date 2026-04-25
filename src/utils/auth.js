const jwt = require('jsonwebtoken');
const config = require('../config/config');

function generateToken(userId, userType) {
  return jwt.sign(
    { userId, userType },
    config.jwtSecret,
    { expiresIn: config.jwtExpiration }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
}

function hashPassword(password) {
  // Simples hash para demonstração (em produção usar bcrypt)
  return Buffer.from(password).toString('base64');
}

function verifyPassword(password, hash) {
  return Buffer.from(password).toString('base64') === hash;
}

module.exports = {
  generateToken,
  verifyToken,
  hashPassword,
  verifyPassword,
};
