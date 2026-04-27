const jwt = require('jsonwebtoken');

function generateToken(userId, role) {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || '1h'
  });
}

module.exports = generateToken;