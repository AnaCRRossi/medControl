const { v4: uuidv4 } = require('uuid');
const database = require('../models/database');
const {
  NotFoundError,
  ValidationError,
  ConflictError,
} = require('../models/errors');
const { validateRequired, validateNumber, validateDate } = require('../models/validators');
const MedicamentoService = require('./MedicamentoService');

const isActive = item => !item.deleted && !item.deletedAt;

function isPrescriptionActive(prescricao) {
  const now = new Date();
  return isActive(prescricao) &&
    new Date(prescricao.dataInicio) <= now &&
    new Date(prescricao.dataFim) >= now;
}

class PrescricaoService {
  verificarInteracoes(medicamentoId, outrosMedicamentosIds = []) {
    const interacoes = [];

    const todasMedicines = database.prescricoes
      .filter(p => p.usuarioId === database.users[0].id && isActive(p) &&
        new Date(p.dataFim) > new Date())
      .map(p => p.medicamentoId)
      .concat(outrosMedicamentosIds)
      .filter(id => id !== medicamentoId);

    todasMedicines.forEach(outroMedicId => {
      const interacao = database.interacoesMedicamentosas.find(
        i => (i.medicamento1Id === medicamentoId && i.medicamento2Id === outroMedicId) ||
          (i.medicamento1Id === outroMedicId && i.medicamento2Id === medicamentoId)
      );

      if (interacao) {
        try {
          const med1 = MedicamentoService.findById(interacao.medicamento1Id);
          const med2 = MedicamentoService.findById(interacao.medicamento2Id);
          interacoes.push({
            medicamentos: [med1.nome, med2.nome],
            nivelRisco: interacao.nivelRisco,
            descricao: interacao.descricao,
          });
        } catch (error) {
          if (!(error instanceof NotFoundError)) {
            throw error;
          }
        }
      }
    });

    return interacoes;
  }

  create(dados, usuarioId) {
    validateRequired(dados.medicamentoId, 'medicamentoId');
    validateRequired(dados.dosagem, 'dosagem');
    validateRequired(dados.frequencia, 'frequencia');
    validateRequired(dados.dataInicio, 'dataInicio');
    validateRequired(dados.dataFim, 'dataFim');

    validateNumber(dados.dosagem, 'dosagem', { min: 1 });

    const medicamento = MedicamentoService.findById(dados.medicamentoId);

    const dataInicio = validateDate(dados.dataInicio, 'dataInicio');
    const dataFim = validateDate(dados.dataFim, 'dataFim');

    if (dataFim <= dataInicio) {
      throw new ValidationError('Data de fim deve ser maior que data de inicio');
    }

    const frequenciaMatch = dados.frequencia.match(/(\d+)h/);
    if (!frequenciaMatch) {
      throw new ValidationError('Frequencia deve estar no formato como "8h", "12h", etc');
    }

    const frequenciaHoras = parseInt(frequenciaMatch[1]);
    if (frequenciaHoras < medicamento.intervaloMinimoHoras) {
      throw new ValidationError(
        `Frequencia nao pode ser menor que o intervalo minimo de ${medicamento.intervaloMinimoHoras}h`
      );
    }

    const outrosMedicamentos = database.prescricoes
      .filter(p => p.usuarioId === usuarioId && isActive(p) &&
        new Date(p.dataFim) > new Date())
      .map(p => p.medicamentoId);

    const interacoes = this.verificarInteracoes(dados.medicamentoId, outrosMedicamentos);

    const prescricoesSobrepostas = database.prescricoes.filter(
      p => p.usuarioId === usuarioId &&
        p.medicamentoId === dados.medicamentoId &&
        isActive(p) &&
        new Date(p.dataFim) > new Date(dataInicio) &&
        new Date(p.dataInicio) < new Date(dataFim)
    );

    if (prescricoesSobrepostas.length > 0) {
      throw new ConflictError('Ja existe prescricao sobreposta para este medicamento');
    }

    const novaPrescricao = {
      id: uuidv4(),
      usuarioId,
      medicamentoId: dados.medicamentoId,
      dosagem: dados.dosagem,
      unidade: medicamento.unidade,
      frequencia: dados.frequencia,
      dataInicio,
      dataFim,
      notasAdicionais: dados.notasAdicionais || '',
      interacoes,
      dataCriacao: new Date(),
      deleted: false,
      deletedAt: null,
    };

    database.prescricoes.push(novaPrescricao);

    return {
      ...novaPrescricao,
      medicamento: {
        id: medicamento.id,
        nome: medicamento.nome,
        descricao: medicamento.descricao,
      },
      alertas: interacoes.length > 0 ? {
        tipo: 'INTERACAO_MEDICAMENTOSA',
        mensagem: `Este medicamento possui ${interacoes.length} interacao(oes)`,
        detalhes: interacoes,
      } : null,
    };
  }

  findById(prescricaoId) {
    const prescricao = database.prescricoes.find(
      p => p.id === prescricaoId && isActive(p)
    );

    if (!prescricao) {
      throw new NotFoundError('Prescricao nao encontrada');
    }

    return prescricao;
  }

  findByUsuario(usuarioId) {
    return database.prescricoes
      .filter(p => p.usuarioId === usuarioId && isActive(p))
      .map(p => {
        const medicamento = MedicamentoService.findById(p.medicamentoId);
        return {
          ...p,
          medicamento: {
            id: medicamento.id,
            nome: medicamento.nome,
          },
        };
      });
  }

  findAll() {
    return database.prescricoes
      .filter(isActive)
      .map(p => {
        const medicamento = MedicamentoService.findById(p.medicamentoId);
        return {
          ...p,
          medicamento: {
            id: medicamento.id,
            nome: medicamento.nome,
          },
        };
      });
  }

  update(prescricaoId, dados, usuarioId, userRole = 'USER') {
    const prescricao = this.findById(prescricaoId);

    if (prescricao.usuarioId !== usuarioId && userRole !== 'ADMIN') {
      throw new ValidationError('Prescricao nao pertence ao usuario');
    }

    if (dados.dataFim) {
      const dataFim = validateDate(dados.dataFim, 'dataFim');
      if (dataFim <= new Date(prescricao.dataInicio)) {
        throw new ValidationError('Data de fim deve ser maior que data de inicio');
      }
      prescricao.dataFim = dataFim;
    }

    if (dados.dosagem !== undefined) {
      validateNumber(dados.dosagem, 'dosagem', { min: 1 });
      prescricao.dosagem = dados.dosagem;
    }

    if (dados.frequencia) {
      const frequenciaMatch = dados.frequencia.match(/(\d+)h/);
      if (!frequenciaMatch) {
        throw new ValidationError('Frequencia deve estar no formato como "8h", "12h", etc');
      }
      const medicamento = MedicamentoService.findById(prescricao.medicamentoId);
      const frequenciaHoras = parseInt(frequenciaMatch[1]);
      if (frequenciaHoras < medicamento.intervaloMinimoHoras) {
        throw new ValidationError(
          `Frequencia nao pode ser menor que o intervalo minimo de ${medicamento.intervaloMinimoHoras}h`
        );
      }
      prescricao.frequencia = dados.frequencia;
    }

    if (dados.notasAdicionais !== undefined) {
      prescricao.notasAdicionais = dados.notasAdicionais;
    }

    return prescricao;
  }

  delete(prescricaoId, usuarioId, userRole = 'USER') {
    const prescricao = this.findById(prescricaoId);

    if (prescricao.usuarioId !== usuarioId && userRole !== 'ADMIN') {
      throw new ValidationError('Prescricao nao pertence ao usuario');
    }

    if (isPrescriptionActive(prescricao)) {
      throw new ValidationError('Nao e possivel deletar prescricao ativa');
    }

    prescricao.deleted = true;
    prescricao.deletedAt = new Date();

    return { mensagem: 'Prescricao deletada com sucesso', deletedAt: prescricao.deletedAt };
  }
}

module.exports = new PrescricaoService();
