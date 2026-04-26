const { v4: uuidv4 } = require('uuid');
const database = require('../models/database');
const { NotFoundError, ConflictError, ValidationError } = require('../models/errors');
const { generateToken, hashPassword, verifyPassword } = require('./authService');
const { validateEmail, validateRequired } = require('../models/validators');

const isActive = item => !item.deleted && !item.deletedAt;

class UserService {
  create(email, senha, nome, tipo = 'USER') {
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

    if (!['ADMIN', 'USER'].includes(tipo)) {
      throw new ValidationError('Tipo de usuario invalido');
    }

    const novoUsuario = {
      id: uuidv4(),
      email,
      senha: hashPassword(senha),
      nome,
      tipo,
      dataCriacao: new Date(),
      deleted: false,
      deletedAt: null,
    };

    database.users.push(novoUsuario);

    return {
      id: novoUsuario.id,
      email: novoUsuario.email,
      nome: novoUsuario.nome,
      tipo: novoUsuario.tipo,
    };
  }

  login(email, senha) {
    validateRequired(email, 'Email');
    validateRequired(senha, 'Senha');

    const usuario = database.users.find(
      u => u.email === email && isActive(u)
    );

    if (!usuario || !verifyPassword(senha, usuario.senha)) {
      throw new ValidationError('Email ou senha incorretos');
    }

    const token = generateToken(usuario.id, usuario.tipo);

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
      },
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
      tipo: usuario.tipo,
      dataCriacao: usuario.dataCriacao,
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

    if (dados.senha) {
      usuario.senha = hashPassword(dados.senha);
    }

    return {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      tipo: usuario.tipo,
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
      throw new ConflictError('Nao e possivel deletar paciente com historico de uso');
    }

    usuario.deleted = true;
    usuario.deletedAt = new Date();

    return { mensagem: 'Paciente deletado com sucesso', deletedAt: usuario.deletedAt };
  }
}

module.exports = new UserService();
