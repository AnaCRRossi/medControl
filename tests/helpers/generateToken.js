const jwt = require('jsonwebtoken');

function generateToken(userId, userType) {
  return jwt.sign({ userId, userType }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || '24h'
  });
}

module.exports = generateToken;