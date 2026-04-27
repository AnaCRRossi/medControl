require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const AuthService = require('./auth.service');
const { NotFoundError, ConflictError, ValidationError } = require('../models/errors');
const { validateEmail, validateRequired } = require('../models/validators');

const prisma = new PrismaClient();

class UserService {
  async create(email, senha, nome, role = 'USER', idade) {
    validateRequired(email, 'Email');
    validateRequired(senha, 'Senha');
    validateRequired(nome, 'Nome');

    if (!validateEmail(email)) {
      throw new ValidationError('Email invalido');
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        deletedAt: null
      }
    });

    if (existingUser) {
      throw new ConflictError('Email ja registrado');
    }

    if (!['ADMIN', 'USER'].includes(role)) {
      throw new ValidationError('Role de usuario invalido');
    }

    if (idade !== undefined && (typeof idade !== 'number' || idade < 0)) {
      throw new ValidationError('Idade deve ser um numero maior ou igual a zero');
    }

    const hashedPassword = await AuthService.hashPassword(senha);

    const novoUsuario = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: nome,
        role,
        age: idade
      }
    });

    return novoUsuario;

    return {
      id: novoUsuario.id,
      email: novoUsuario.email,
      nome: novoUsuario.nome,
      role: novoUsuario.role,
      idade: novoUsuario.idade,
    };
  }

  async findById(userId) {
    const usuario = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null
      }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    return {
      id: usuario.id,
      email: usuario.email,
      name: usuario.name,
      role: usuario.role,
      createdAt: usuario.createdAt,
      age: usuario.age,
    };
  }

  async findAll() {
    const users = await prisma.user.findMany({
      where: {
        deletedAt: null
      }
    });

    return users.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      createdAt: u.createdAt,
      age: u.age,
    }));
  }

  async update(userId, dados) {
    const usuario = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null
      }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    const updateData = {};

    if (dados.email && dados.email !== usuario.email) {
      if (!validateEmail(dados.email)) {
        throw new ValidationError('Email invalido');
      }

      const existeOutro = await prisma.user.findFirst({
        where: {
          email: dados.email.toLowerCase(),
          id: { not: userId },
          deletedAt: null
        }
      });
      if (existeOutro) {
        throw new ConflictError('Email ja registrado');
      }
      updateData.email = dados.email.toLowerCase();
    }

    if (dados.nome) {
      updateData.name = dados.nome;
    }

    if (dados.idade !== undefined) {
      if (typeof dados.idade !== 'number' || dados.idade < 0) {
        throw new ValidationError('Idade deve ser um numero maior ou igual a zero');
      }
      updateData.age = dados.idade;
    }

    if (dados.senha) {
      updateData.password = await AuthService.hashPassword(dados.senha);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role,
      age: updatedUser.age,
    };
  }

  async delete(userId) {
    const usuario = await prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null
      }
    });

    if (!usuario) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    // Check if user has patients with usage records
    const patients = await prisma.patient.findMany({
      where: {
        userId: userId,
        deletedAt: null
      },
      include: {
        prescriptions: {
          include: {
            usageRecords: true
          }
        }
      }
    });

    const hasUsageHistory = patients.some(patient =>
      patient.prescriptions.some(prescription =>
        prescription.usageRecords.length > 0
      )
    );

    if (hasUsageHistory) {
      throw new ValidationError('Nao e possivel deletar paciente com historico de uso');
    }

    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() }
    });

    return { mensagem: 'Paciente deletado com sucesso', deletedAt: new Date() };
  }
}

module.exports = new UserService();
module.exports.prisma = prisma;
