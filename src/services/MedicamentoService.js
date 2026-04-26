const { v4: uuidv4 } = require('uuid');
const database = require('../models/database');
const { NotFoundError, ValidationError, ConflictError } = require('../models/errors');
const { validateRequired, validateNumber } = require('../models/validators');

const DOSE_MAXIMA_DIARIA_KEYS = [
  'doseMaximaDiaria',
  'doseM\u00e1ximaDiaria',
  'doseM\u00c3\u00a1ximaDiaria',
  'doseM\u00c3\u0083\u00c2\u00a1ximaDiaria',
];
const isActive = item => !item.deleted && !item.deletedAt;

function getDoseMaximaDiaria(item) {
  const key = DOSE_MAXIMA_DIARIA_KEYS.find(doseKey => item[doseKey] !== undefined);
  return key ? item[key] : undefined;
}

function setDoseMaximaDiaria(item, value) {
  DOSE_MAXIMA_DIARIA_KEYS.forEach(doseKey => {
    item[doseKey] = value;
  });
}

function isPrescriptionActive(prescricao) {
  const now = new Date();
  return isActive(prescricao) &&
    new Date(prescricao.dataInicio) <= now &&
    new Date(prescricao.dataFim) >= now;
}

class MedicamentoService {
  create(dados) {
    validateRequired(dados.nome, 'Nome');
    validateRequired(dados.unidade, 'Unidade');
    validateNumber(dados.intervaloMinimoHoras, 'intervaloMinimoHoras', { min: 1 });

    const doseMaximaDiaria = getDoseMaximaDiaria(dados);
    validateNumber(doseMaximaDiaria, 'doseMaximaDiaria', { min: 1 });

    const existente = database.medicamentos.find(
      m => m.nome.toLowerCase() === dados.nome.toLowerCase() && isActive(m)
    );

    if (existente) {
      throw new ConflictError('Medicamento com este nome ja existe');
    }

    const novoMedicamento = {
      id: uuidv4(),
      nome: dados.nome,
      descricao: dados.descricao || '',
      intervaloMinimoHoras: dados.intervaloMinimoHoras,
      unidade: dados.unidade,
      dataCriacao: new Date(),
      deleted: false,
      deletedAt: null,
    };
    setDoseMaximaDiaria(novoMedicamento, doseMaximaDiaria);

    database.medicamentos.push(novoMedicamento);
    return novoMedicamento;
  }

  findById(medicamentoId) {
    const medicamento = database.medicamentos.find(
      m => m.id === medicamentoId && isActive(m)
    );

    if (!medicamento) {
      throw new NotFoundError('Medicamento nao encontrado');
    }

    return medicamento;
  }

  findAll() {
    return database.medicamentos.filter(isActive);
  }

  update(medicamentoId, dados) {
    const medicamento = this.findById(medicamentoId);

    if (dados.nome && dados.nome !== medicamento.nome) {
      const existente = database.medicamentos.find(
        m => m.nome.toLowerCase() === dados.nome.toLowerCase() &&
          m.id !== medicamentoId && isActive(m)
      );
      if (existente) {
        throw new ConflictError('Medicamento com este nome ja existe');
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

    const doseMaximaDiaria = getDoseMaximaDiaria(dados);
    if (doseMaximaDiaria !== undefined) {
      validateNumber(doseMaximaDiaria, 'doseMaximaDiaria', { min: 1 });
      setDoseMaximaDiaria(medicamento, doseMaximaDiaria);
    }

    if (dados.unidade) {
      medicamento.unidade = dados.unidade;
    }

    return medicamento;
  }

  delete(medicamentoId) {
    const medicamento = this.findById(medicamentoId);

    const prescricoesAtivas = database.prescricoes.filter(
      p => p.medicamentoId === medicamentoId && isPrescriptionActive(p)
    );

    if (prescricoesAtivas.length > 0) {
      throw new ValidationError('Nao e possivel deletar medicamento com prescricao ativa');
    }

    medicamento.deleted = true;
    medicamento.deletedAt = new Date();

    return { mensagem: 'Medicamento deletado com sucesso', deletedAt: medicamento.deletedAt };
  }
}

module.exports = new MedicamentoService();
