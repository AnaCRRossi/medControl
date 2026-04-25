const { v4: uuidv4 } = require('uuid');
const database = require('../database/database');
const {
  NotFoundError,
  ValidationError,
  ConflictError,
} = require('../utils/errors');
const { validateRequired, validateDate } = require('../utils/validators');
const PrescricaoService = require('./PrescricaoService');
const MedicamentoService = require('./MedicamentoService');

class RegistroUsoService {
  validarIntervaloDoses(prescricaoId, dataHora) {
    const prescricao = PrescricaoService.findById(prescricaoId);
    const medicamento = MedicamentoService.findById(prescricao.medicamentoId);

    // Buscar último registro de uso desta prescrição
    const ultimoRegistro = database.registrosUso
      .filter(r => r.prescricaoId === prescricaoId && !r.deleted)
      .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];

    if (ultimoRegistro) {
      const horasDecorridas =
        (new Date(dataHora) - new Date(ultimoRegistro.dataHora)) / (1000 * 60 * 60);

      if (horasDecorridas < medicamento.intervaloMinimoHoras) {
        return {
          valido: false,
          mensagem: `Intervalo mínimo de ${medicamento.intervaloMinimoHoras}h não atingido. Próxima dose permitida em ${ultimoRegistro.dataHora}`,
        };
      }
    }

    return { valido: true };
  }

  validarDoseMaximaDiaria(prescricaoId, dosagem, dataHora) {
    const prescricao = PrescricaoService.findById(prescricaoId);
    const medicamento = MedicamentoService.findById(prescricao.medicamentoId);

    const dataAtual = new Date(dataHora);
    const inicioDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dataAtual.getDate());
    const fimDia = new Date(inicioDia.getTime() + 24 * 60 * 60 * 1000);

    // Somar todas as doses do dia para este medicamento
    const dosequeDoDia = database.registrosUso
      .filter(r => {
        const prescricao = PrescricaoService.findById(r.prescricaoId);
        return prescricao.medicamentoId === medicamento.id &&
               !r.deleted &&
               new Date(r.dataHora) >= inicioDia &&
               new Date(r.dataHora) < fimDia;
      })
      .reduce((total, r) => total + r.dosagem, 0);

    const doseTotalApos = dosequeDoDia + dosagem;

    if (doseTotalApos > medicamento.doseMáximaDiaria) {
      return {
        valido: false,
        mensagem: `Dose máxima diária (${medicamento.doseMáximaDiaria}${medicamento.unidade}) seria excedida`,
        doseTotalAtual: dosequeDoDia,
      };
    }

    // Alertar se atingir 80% do limite
    if (doseTotalApos >= medicamento.doseMáximaDiaria * 0.8) {
      return {
        valido: true,
        alerta: {
          tipo: 'AVISO_DOSE_MAXIMA',
          mensagem: `Atingidos ${((doseTotalApos / medicamento.doseMáximaDiaria) * 100).toFixed(1)}% da dose máxima diária`,
          percentual: ((doseTotalApos / medicamento.doseMáximaDiaria) * 100).toFixed(1),
        },
      };
    }

    return { valido: true };
  }

  validarPeriodoPrescricao(prescricaoId, dataHora) {
    const prescricao = PrescricaoService.findById(prescricaoId);
    const data = new Date(dataHora);

    if (data < new Date(prescricao.dataInicio)) {
      return {
        valido: false,
        mensagem: `Uso anterior à data de início da prescrição (${prescricao.dataInicio})`,
      };
    }

    if (data > new Date(prescricao.dataFim)) {
      return {
        valido: false,
        mensagem: `Uso posterior à data de término da prescrição (${prescricao.dataFim})`,
      };
    }

    return { valido: true };
  }

  validarDuplicidade(prescricaoId, dataHora) {
    const dataFormatada = new Date(dataHora);
    const horaExata = dataFormatada.toISOString();

    const existe = database.registrosUso.find(
      r => r.prescricaoId === prescricaoId &&
           !r.deleted &&
           new Date(r.dataHora).getTime() === new Date(horaExata).getTime()
    );

    if (existe) {
      return {
        valido: false,
        mensagem: 'Já existe registro de uso no mesmo horário',
      };
    }

    return { valido: true };
  }

  create(dados, usuarioId, userType) {
    validateRequired(dados.prescricaoId, 'prescricaoId');
    validateRequired(dados.dosagem, 'dosagem');
    validateRequired(dados.dataHora, 'dataHora');

    const prescricao = PrescricaoService.findById(dados.prescricaoId);

    // Verificar se o registro pertence ao usuário ou se é ADMIN
    if (prescricao.usuarioId !== usuarioId && userType !== 'ADMIN') {
      throw new ValidationError('Prescrição não pertence ao usuário');
    }

    const dataHora = validateDate(dados.dataHora, 'dataHora');

    // Validar duplicidade
    const validacaoDuplicidade = this.validarDuplicidade(dados.prescricaoId, dataHora);
    if (!validacaoDuplicidade.valido) {
      throw new ConflictError(validacaoDuplicidade.mensagem);
    }

    // Validar período da prescrição
    const validacaoPeriodo = this.validarPeriodoPrescricao(dados.prescricaoId, dataHora);
    if (!validacaoPeriodo.valido) {
      throw new ValidationError(validacaoPeriodo.mensagem);
    }

    // Validar intervalo entre doses
    const validacaoIntervalo = this.validarIntervaloDoses(dados.prescricaoId, dataHora);
    if (!validacaoIntervalo.valido) {
      throw new ValidationError(validacaoIntervalo.mensagem);
    }

    // Validar dose máxima diária
    const validacaoDoseMax = this.validarDoseMaximaDiaria(
      dados.prescricaoId,
      dados.dosagem,
      dataHora
    );
    if (!validacaoDoseMax.valido) {
      throw new ValidationError(validacaoDoseMax.mensagem);
    }

    const novoRegistro = {
      id: uuidv4(),
      prescricaoId: dados.prescricaoId,
      dosagem: dados.dosagem,
      dataHora,
      notas: dados.notas || '',
      dataCriacao: new Date(),
      deleted: false,
    };

    database.registrosUso.push(novoRegistro);

    const prescricaoData = {
      ...prescricao,
      medicamento: MedicamentoService.findById(prescricao.medicamentoId),
    };

    return {
      ...novoRegistro,
      prescricao: prescricaoData,
      alertas: validacaoDoseMax.alerta ? [validacaoDoseMax.alerta] : [],
    };
  }

  findById(registroId) {
    const registro = database.registrosUso.find(
      r => r.id === registroId && !r.deleted
    );

    if (!registro) {
      throw new NotFoundError('Registro de uso não encontrado');
    }

    return registro;
  }

  findByPrescricao(prescricaoId) {
    return database.registrosUso
      .filter(r => r.prescricaoId === prescricaoId && !r.deleted)
      .map(r => ({
        ...r,
        prescricao: PrescricaoService.findById(prescricaoId),
      }));
  }

  findByUsuario(usuarioId, userType) {
    const filtro = userType === 'ADMIN'
      ? r => !r.deleted
      : r => {
          const prescricao = PrescricaoService.findById(r.prescricaoId);
          return !r.deleted && prescricao.usuarioId === usuarioId;
        };

    return database.registrosUso
      .filter(filtro)
      .map(r => {
        const prescricao = PrescricaoService.findById(r.prescricaoId);
        const medicamento = MedicamentoService.findById(prescricao.medicamentoId);
        return {
          ...r,
          prescricao: {
            ...prescricao,
            medicamento,
          },
        };
      });
  }

  findAll() {
    return database.registrosUso
      .filter(r => !r.deleted)
      .map(r => {
        const prescricao = PrescricaoService.findById(r.prescricaoId);
        const medicamento = MedicamentoService.findById(prescricao.medicamentoId);
        return {
          ...r,
          prescricao: {
            ...prescricao,
            medicamento,
          },
        };
      });
  }

  delete(registroId) {
    const registro = this.findById(registroId);
    registro.deleted = true;

    return { mensagem: 'Registro de uso deletado com sucesso' };
  }
}

module.exports = new RegistroUsoService();
