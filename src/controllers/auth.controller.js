const { PrismaClient } = require('@prisma/client');
const AuthService = require('../services/auth.service');
const UserService = require('../services/UserService');
const Database = require('../models/database');
const { sendResponse } = require('./response');

const prisma = new PrismaClient();

class AuthController {
  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return sendResponse(res, 400, 'Email e senha sao obrigatorios');
      }

      let user = await prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
        },
      });

      if (!user) {
        const memoryUser = Database.users.find(u => u.email === email && !u.deleted && !u.deletedAt);
        if (memoryUser) {
          user = {
            id: memoryUser.id,
            email: memoryUser.email,
            password: memoryUser.senha,
            name: memoryUser.nome,
            role: memoryUser.role,
            age: memoryUser.idade,
            createdAt: memoryUser.dataCriacao,
          };
        }
      }

      if (!user) {
        return sendResponse(res, 401, 'Credenciais invalidas');
      }

      const isPasswordValid = await AuthService.comparePassword(senha, user.password);

      if (!isPasswordValid) {
        return sendResponse(res, 401, 'Credenciais invalidas');
      }

      const token = AuthService.generateToken(user);

      return sendResponse(res, 200, 'Login realizado com sucesso', {
        token,
        usuario: {
          id: user.id,
          email: user.email,
          nome: user.name,
          role: user.role,
          idade: user.age,
          dataCriacao: user.createdAt,
        },
      });
    } catch (error) {
      console.error('Erro no login:', error);
      return sendResponse(res, 500, 'Erro interno do servidor');
    }
  }

  async register(req, res) {
    try {
      const { email, senha, nome, tipo } = req.body;

      if (!email || !senha || !nome) {
        return sendResponse(res, 400, 'Email, senha e nome sao obrigatorios');
      }

      const usuario = await UserService.create(email, senha, nome, tipo || 'USER');
      return sendResponse(res, 201, 'Usuario registrado com sucesso', usuario);
    } catch (error) {
      console.error('Erro no registro:', error);
      if (error.message === 'Email ja registrado') {
        return sendResponse(res, 409, error.message);
      }
      return sendResponse(res, 500, 'Erro interno do servidor');
    }
  }
}

module.exports = new AuthController();
