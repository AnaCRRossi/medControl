const { v4: uuidv4 } = require('uuid');
const database = require('../database/database');
const { NotFoundError, ValidationError, ConflictError } = require('../utils/errors');
const { validateRequired, validateNumber } = require('../utils/validators');

class MedicamentoService {
  create(dados) {
    validateRequired(dados.nome, 'Nome');
    validateRequired(dados.unidade, 'Unidade');
    validateNumber(dados.intervaloMinimoHoras, 'intervaloMinimoHoras', { min: 1 });
    validateNumber(dados.doseMáximaDiaria, 'doseMáximaDiaria', { min: 1 });

    const existente = database.medicamentos.find(
      m => m.nome.toLowerCase() === dados.nome.toLowerCase() && !m.deleted
    );

    if (existente) {
      throw new ConflictError('Medicamento com este nome já existe');
    }

    const novoMedicamento = {
      id: uuidv4(),
      nome: dados.nome,
      descricao: dados.descricao || '',
      intervaloMinimoHoras: dados.intervaloMinimoHoras,
      doseMáximaDiaria: dados.doseMáximaDiaria,
      unidade: dados.unidade,
      dataCriacao: new Date(),
      deleted: false,
    };

    database.medicamentos.push(novoMedicamento);
    return novoMedicamento;
  }

  findById(medicamentoId) {
    const medicamento = database.medicamentos.find(
      m => m.id === medicamentoId && !m.deleted
    );

    if (!medicamento) {
      throw new NotFoundError('Medicamento não encontrado');
    }

    return medicamento;
  }

  findAll() {
    return database.medicamentos.filter(m => !m.deleted);
  }

  update(medicamentoId, dados) {
    const medicamento = this.findById(medicamentoId);

    if (dados.nome && dados.nome !== medicamento.nome) {
      const existente = database.medicamentos.find(
        m => m.nome.toLowerCase() === dados.nome.toLowerCase() &&
            m.id !== medicamentoId && !m.deleted
      );
      if (existente) {
        throw new ConflictError('Medicamento com este nome já existe');
      }
      medicamento.nome = dados.nome;
    }

    if (dados.descricao !== undefined) {
      medicamento.descricao = dados.descricao;
    }

    if (dados.intervaloMinimoHoras !== undefined) {
      validateNumber(dados.intervaloMinimoHoras, 'intervaloMinimoHoras', { min: 1 });
      medicamento.intervaloMinimoHoras = dados.intervaloMinimoHoras;
    }

    if (dados.doseMáximaDiaria !== undefined) {
      validateNumber(dados.doseMáximaDiaria, 'doseMáximaDiaria', { min: 1 });
      medicamento.doseMáximaDiaria = dados.doseMáximaDiaria;
    }

    if (dados.unidade) {
      medicamento.unidade = dados.unidade;
    }

    return medicamento;
  }

  delete(medicamentoId) {
    const medicamento = this.findById(medicamentoId);

    // Verificar se há prescrições ativas com este medicamento
    const prescricoesAtivas = database.prescricoes.filter(
      p => p.medicamentoId === medicamentoId && !p.deleted && 
           new Date(p.dataFim) > new Date()
    );

    if (prescricoesAtivas.length > 0) {
      throw new ValidationError(
        'Não é possível deletar medicamento com prescrições ativas'
      );
    }

    // Soft delete
    medicamento.deleted = true;

    return { mensagem: 'Medicamento deletado com sucesso' };
  }
}

module.exports = new MedicamentoService();
