const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const jwtExpiration = process.env.JWT_EXPIRATION || '24h';

function generateToken(userId, userType) {
  return jwt.sign(
    { userId, userType },
    jwtSecret,
    { expiresIn: jwtExpiration }
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, jwtSecret);
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
