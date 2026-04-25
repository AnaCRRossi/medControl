const { v4: uuidv4 } = require('uuid');
const database = require('../database/database');
const { NotFoundError, ConflictError, ValidationError } = require('../utils/errors');
const { generateToken, hashPassword, verifyPassword } = require('../utils/auth');
const { validateEmail, validateRequired } = require('../utils/validators');

class UserService {
  create(email, senha, nome, tipo = 'USER') {
    validateRequired(email, 'Email');
    validateRequired(senha, 'Senha');
    validateRequired(nome, 'Nome');
    validateEmail(email);

    // Verificar se o email já existe
    const existingUser = database.users.find(
      u => u.email === email && !u.deleted
    );

    if (existingUser) {
      throw new ConflictError('Email já registrado');
    }

    if (!['ADMIN', 'USER'].includes(tipo)) {
      throw new ValidationError('Tipo de usuário inválido');
    }

    const novoUsuario = {
      id: uuidv4(),
      email,
      senha: hashPassword(senha),
      nome,
      tipo,
      dataCriacao: new Date(),
      deleted: false,
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
      u => u.email === email && !u.deleted
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
    const usuario = database.users.find(u => u.id === userId && !u.deleted);

    if (!usuario) {
      throw new NotFoundError('Usuário não encontrado');
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
      .filter(u => !u.deleted)
      .map(u => ({
        id: u.id,
        email: u.email,
        nome: u.nome,
        tipo: u.tipo,
        dataCriacao: u.dataCriacao,
      }));
  }

  update(userId, dados) {
    const usuario = database.users.find(u => u.id === userId && !u.deleted);

    if (!usuario) {
      throw new NotFoundError('Usuário não encontrado');
    }

    if (dados.email && dados.email !== usuario.email) {
      const existeOutro = database.users.find(
        u => u.email === dados.email && u.id !== userId && !u.deleted
      );
      if (existeOutro) {
        throw new ConflictError('Email já registrado');
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
    const usuario = database.users.find(u => u.id === userId && !u.deleted);

    if (!usuario) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Soft delete
    usuario.deleted = true;

    return { mensagem: 'Usuário deletado com sucesso' };
  }
}

module.exports = new UserService();
