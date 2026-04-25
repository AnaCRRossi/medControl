const { v4: uuidv4 } = require('uuid');
const database = require('../database/database');
const {
  NotFoundError,
  ValidationError,
  ConflictError,
} = require('../utils/errors');
const { validateRequired, validateNumber, validateDate } = require('../utils/validators');
const MedicamentoService = require('./MedicamentoService');

class PrescricaoService {
  verificarInteracoes(medicamentoId, outrosMedicamentosIds = []) {
    const interacoes = [];

    const todasMedicines = database.prescricoes
      .filter(p => p.usuarioId === database.users[0].id && !p.deleted &&
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
        const med1 = MedicamentoService.findById(interacao.medicamento1Id);
        const med2 = MedicamentoService.findById(interacao.medicamento2Id);
        interacoes.push({
          medicamentos: [med1.nome, med2.nome],
          nivelRisco: interacao.nivelRisco,
          descricao: interacao.descricao,
        });
      }
    });

    return interacoes;
  }

  create(dados, usuarioId) {
    validateRequired(dados.medicamentoId, 'medicamentoId');
    validateRequired(dados.dosagem, 'dosagem');
    validateRequired(dados.frequencia, 'frequência');
    validateRequired(dados.dataInicio, 'dataInicio');
    validateRequired(dados.dataFim, 'dataFim');

    validateNumber(dados.dosagem, 'dosagem', { min: 1 });

    const medicamento = MedicamentoService.findById(dados.medicamentoId);

    const dataInicio = validateDate(dados.dataInicio, 'dataInicio');
    const dataFim = validateDate(dados.dataFim, 'dataFim');

    if (dataFim <= dataInicio) {
      throw new ValidationError('Data de fim deve ser maior que data de início');
    }

    // Validar frequência com intervalo mínimo
    const frequenciaMatch = dados.frequencia.match(/(\d+)h/);
    if (!frequenciaMatch) {
      throw new ValidationError('Frequência deve estar no formato como "8h", "12h", etc');
    }

    const frequenciaHoras = parseInt(frequenciaMatch[1]);
    if (frequenciaHoras < medicamento.intervaloMinimoHoras) {
      throw new ValidationError(
        `Frequência não pode ser menor que o intervalo mínimo de ${medicamento.intervaloMinimoHoras}h`
      );
    }

    // Verificar interações medicamentosas
    const outrosMedicamentos = database.prescricoes
      .filter(p => p.usuarioId === usuarioId && !p.deleted &&
              new Date(p.dataFim) > new Date())
      .map(p => p.medicamentoId);

    const interacoes = this.verificarInteracoes(dados.medicamentoId, outrosMedicamentos);

    // Verificar sobreposição de doses
    const prescricoesSobrepostas = database.prescricoes.filter(
      p => p.usuarioId === usuarioId && 
           p.medicamentoId === dados.medicamentoId &&
           !p.deleted &&
           new Date(p.dataFim) > new Date(dataInicio) &&
           new Date(p.dataInicio) < new Date(dataFim)
    );

    if (prescricoesSobrepostas.length > 0) {
      throw new ConflictError('Já existe prescrição sobreposta para este medicamento');
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
        mensagem: `Este medicamento possui ${interacoes.length} interação(ões)`,
        detalhes: interacoes,
      } : null,
    };
  }

  findById(prescricaoId) {
    const prescricao = database.prescricoes.find(
      p => p.id === prescricaoId && !p.deleted
    );

    if (!prescricao) {
      throw new NotFoundError('Prescrição não encontrada');
    }

    return prescricao;
  }

  findByUsuario(usuarioId) {
    return database.prescricoes
      .filter(p => p.usuarioId === usuarioId && !p.deleted)
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
      .filter(p => !p.deleted)
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

  update(prescricaoId, dados, usuarioId) {
    const prescricao = this.findById(prescricaoId);

    if (prescricao.usuarioId !== usuarioId) {
      throw new ValidationError('Prescrição não pertence ao usuário');
    }

    if (dados.dataFim) {
      const dataFim = validateDate(dados.dataFim, 'dataFim');
      if (dataFim <= new Date(prescricao.dataInicio)) {
        throw new ValidationError('Data de fim deve ser maior que data de início');
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
        throw new ValidationError('Frequência deve estar no formato como "8h", "12h", etc');
      }
      const medicamento = MedicamentoService.findById(prescricao.medicamentoId);
      const frequenciaHoras = parseInt(frequenciaMatch[1]);
      if (frequenciaHoras < medicamento.intervaloMinimoHoras) {
        throw new ValidationError(
          `Frequência não pode ser menor que o intervalo mínimo de ${medicamento.intervaloMinimoHoras}h`
        );
      }
      prescricao.frequencia = dados.frequencia;
    }

    if (dados.notasAdicionais !== undefined) {
      prescricao.notasAdicionais = dados.notasAdicionais;
    }

    return prescricao;
  }

  delete(prescricaoId, usuarioId) {
    const prescricao = this.findById(prescricaoId);

    if (prescricao.usuarioId !== usuarioId) {
      throw new ValidationError('Prescrição não pertence ao usuário');
    }

    // Verificar se há registros de uso vinculados
    const registrosVinculados = database.registrosUso.filter(
      r => r.prescricaoId === prescricaoId && !r.deleted
    );

    if (registrosVinculados.length > 0) {
      throw new ValidationError(
        'Não é possível deletar prescrição com registros de uso vinculados'
      );
    }

    prescricao.deleted = true;

    return { mensagem: 'Prescrição deletada com sucesso' };
  }
}

module.exports = new PrescricaoService();
