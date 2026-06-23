const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

class Database {
  constructor() {
    this.users = [];
    this.medicamentos = [];
    this.prescricoes = [];
    this.registrosUso = [];
    this.interacoesMedicamentosas = [];
    this.initializeDefaultData();
  }

  initializeDefaultData() {
    // Admin padrão para testes
    const hashedPassword = bcrypt.hashSync('admin123', 10);
    this.users.push({
      id: uuidv4(),
      email: 'admin@medcontrol.com',
      senha: hashedPassword,
      role: 'ADMIN',
      nome: 'Admin User',
      dataCriacao: new Date(),
      deleted: false,
      deletedAt: null,
    });

    // Medicamentos padrão
    this.medicamentos.push(
      {
        id: uuidv4(),
        nome: 'Paracetamol',
        descricao: 'Analgésico e antipirético',
        intervaloMinimoHoras: 4,
        doseMáximaDiaria: 4000,
        unidade: 'mg',
        dataCriacao: new Date(),
        deleted: false,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        nome: 'Ibuprofeno',
        descricao: 'Anti-inflamatório não esteróide',
        intervaloMinimoHoras: 6,
        doseMáximaDiaria: 2400,
        unidade: 'mg',
        dataCriacao: new Date(),
        deleted: false,
        deletedAt: null,
      },
      {
        id: uuidv4(),
        nome: 'Amoxicilina',
        descricao: 'Antibiótico beta-lactâmico',
        intervaloMinimoHoras: 8,
        doseMáximaDiaria: 3000,
        unidade: 'mg',
        dataCriacao: new Date(),
        deleted: false,
        deletedAt: null,
      }
    );

    // Interações medicamentosas
    this.interacoesMedicamentosas.push(
      {
        id: uuidv4(),
        medicamento1Id: this.medicamentos[0].id, // Paracetamol
        medicamento2Id: this.medicamentos[1].id, // Ibuprofeno
        nivelRisco: 'HIGH',
        descricao: 'Risco de toxicidade hepática aumentada',
        dataCriacao: new Date(),
      }
    );
  }

  reset() {
    this.users = [];
    this.medicamentos = [];
    this.prescricoes = [];
    this.registrosUso = [];
    this.interacoesMedicamentosas = [];
    this.initializeDefaultData();
  }
}

module.exports = new Database();
