const { v4: uuidv4 } = require('uuid');
const database = require('../models/database');
const AuthService = require('./auth.service');
const { NotFoundError, ConflictError, ValidationError } = require('../models/errors');
const { validateEmail, validateRequired } = require('../models/validators');

const isActive = item => !item.deleted && !item.deletedAt;

class UserService {
  async create(email, senha, nome, role = 'USER', idade) {
    validateRequired(email, 'Email');
    validateRequired(senha, 'Senha');
    validateRequired(nome, 'Nome');

    if (!validateEmail(email)) {
      throw new ValidationError('Email invalido');
    }

    const existingUser = database.users.find(
      u => u.email === email && isActive(u)
    );

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

    const novoUsuario = {
      id: uuidv4(),
      email,
      senha: hashedPassword,
      nome,
      role,
      idade,
      dataCriacao: new Date(),
      deleted: false,
      deletedAt: null,
    };

    database.users.push(novoUsuario);

    return {
      id: novoUsuario.id,
      email: novoUsuario.email,
      nome: novoUsuario.nome,
      role: novoUsuario.role,
      idade: novoUsuario.idade,
    };
  }

  findById(userId) {
    const usuario = database.users.find(u => u.id === userId && isActive(u));

    if (!usuario) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      role: usuario.role,
      dataCriacao: usuario.dataCriacao,
      idade: usuario.idade,
    };
  }

  findAll() {
    return database.users
      .filter(isActive)
      .map(u => ({
        id: u.id,
        email: u.email,
        nome: u.nome,
        tipo: u.tipo,
        dataCriacao: u.dataCriacao,
        idade: u.idade,
      }));
  }

  update(userId, dados) {
    const usuario = database.users.find(u => u.id === userId && isActive(u));

    if (!usuario) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    if (dados.email && dados.email !== usuario.email) {
      if (!validateEmail(dados.email)) {
        throw new ValidationError('Email invalido');
      }

      const existeOutro = database.users.find(
        u => u.email === dados.email && u.id !== userId && isActive(u)
      );
      if (existeOutro) {
        throw new ConflictError('Email ja registrado');
      }
      usuario.email = dados.email;
    }

    if (dados.nome) {
      usuario.nome = dados.nome;
    }

    if (dados.idade !== undefined) {
      if (typeof dados.idade !== 'number' || dados.idade < 0) {
        throw new ValidationError('Idade deve ser um numero maior ou igual a zero');
      }
      usuario.idade = dados.idade;
    }

    if (dados.senha) {
      usuario.senha = hashPassword(dados.senha);
    }

    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipo: usuario.tipo,
      idade: usuario.idade,
    };
  }

  delete(userId) {
    const usuario = database.users.find(u => u.id === userId && isActive(u));

    if (!usuario) {
      throw new NotFoundError('Usuario nao encontrado');
    }

    const prescricoesDoUsuario = database.prescricoes
      .filter(p => p.usuarioId === userId)
      .map(p => p.id);

    const possuiHistoricoUso = database.registrosUso.some(
      r => prescricoesDoUsuario.includes(r.prescricaoId)
    );

    if (possuiHistoricoUso) {
      throw new ValidationError('Nao e possivel deletar paciente com historico de uso');
    }

    usuario.deleted = true;
    usuario.deletedAt = new Date();

    return { mensagem: 'Paciente deletado com sucesso', deletedAt: usuario.deletedAt };
  }
}

module.exports = new UserService();
