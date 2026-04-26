const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_EXPIRATION } = process.env;

class AuthService {
  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  generateToken(user) {
    const payload = {
      id: user.id,
      role: user.role,
    };
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }
}

module.exports = new AuthService();