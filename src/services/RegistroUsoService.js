const { v4: uuidv4 } = require('uuid');
const database = require('../models/database');
const {
  NotFoundError,
  ValidationError,
  ConflictError,
} = require('../models/errors');
const { validateRequired, validateDate } = require('../models/validators');
const PrescricaoService = require('./PrescricaoService');
const MedicamentoService = require('./MedicamentoService');

const DOSE_MAXIMA_DIARIA = 'doseMÃ¡ximaDiaria';
const isActive = item => !item.deleted && !item.deletedAt;

const doseMaximaDiariaKeys = [
  'doseMaximaDiaria',
  'doseM\u00e1ximaDiaria',
  'doseM\u00c3\u00a1ximaDiaria',
  'doseM\u00c3\u0083\u00c2\u00a1ximaDiaria',
];

function getDoseMaximaDiaria(item) {
  const key = doseMaximaDiariaKeys.find(doseKey => item[doseKey] !== undefined);
  return key ? item[key] : undefined;
}

class RegistroUsoService {
  validarIntervaloDoses(prescricaoId, dataHora) {
    const prescricao = PrescricaoService.findById(prescricaoId);
    const medicamento = MedicamentoService.findById(prescricao.medicamentoId);

    const ultimoRegistro = database.registrosUso
      .filter(r => r.prescricaoId === prescricaoId && isActive(r))
      .sort((a, b) => new Date(b.dataHora) - new Date(a.dataHora))[0];

    if (ultimoRegistro) {
      const horasDecorridas =
        (new Date(dataHora) - new Date(ultimoRegistro.dataHora)) / (1000 * 60 * 60);

      if (horasDecorridas < medicamento.intervaloMinimoHoras) {
        return {
          valido: false,
          mensagem: `Intervalo minimo de ${medicamento.intervaloMinimoHoras}h nao atingido`,
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

    const doseDoDia = database.registrosUso
      .filter(r => {
        const registroPrescricao = PrescricaoService.findById(r.prescricaoId);
        return registroPrescricao.medicamentoId === medicamento.id &&
          isActive(r) &&
          new Date(r.dataHora) >= inicioDia &&
          new Date(r.dataHora) < fimDia;
      })
      .reduce((total, r) => total + r.dosagem, 0);

    const doseTotalApos = doseDoDia + dosagem;

    const doseMaximaDiaria = getDoseMaximaDiaria(medicamento);

    if (doseTotalApos > doseMaximaDiaria) {
      return {
        valido: false,
        mensagem: `Dose maxima diaria (${doseMaximaDiaria}${medicamento.unidade}) seria excedida`,
        doseTotalAtual: doseDoDia,
      };
    }

    if (doseTotalApos >= doseMaximaDiaria * 0.8) {
      return {
        valido: true,
        alerta: {
          tipo: 'AVISO_DOSE_MAXIMA',
          mensagem: `Atingidos ${((doseTotalApos / doseMaximaDiaria) * 100).toFixed(1)}% da dose maxima diaria`,
          percentual: ((doseTotalApos / doseMaximaDiaria) * 100).toFixed(1),
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
        mensagem: 'Uso anterior a data de inicio da prescricao',
      };
    }

    if (data > new Date(prescricao.dataFim)) {
      return {
        valido: false,
        mensagem: 'Uso posterior a data de termino da prescricao',
      };
    }

    return { valido: true };
  }

  validarDuplicidade(prescricaoId, dataHora) {
    const dataFormatada = new Date(dataHora);
    const horaExata = dataFormatada.toISOString();

    const existe = database.registrosUso.find(
      r => r.prescricaoId === prescricaoId &&
        isActive(r) &&
        new Date(r.dataHora).getTime() === new Date(horaExata).getTime()
    );

    if (existe) {
      return {
        valido: false,
        mensagem: 'Ja existe registro de uso no mesmo horario',
      };
    }

    return { valido: true };
  }

  create(dados, usuarioId, userType) {
    validateRequired(dados.prescricaoId, 'prescricaoId');
    validateRequired(dados.dosagem, 'dosagem');
    validateRequired(dados.dataHora, 'dataHora');

    const prescricao = PrescricaoService.findById(dados.prescricaoId);

    if (prescricao.usuarioId !== usuarioId && userType !== 'ADMIN') {
      throw new ValidationError('Prescricao nao pertence ao usuario');
    }

    const dataHora = validateDate(dados.dataHora, 'dataHora');

    const validacaoDuplicidade = this.validarDuplicidade(dados.prescricaoId, dataHora);
    if (!validacaoDuplicidade.valido) {
      throw new ConflictError(validacaoDuplicidade.mensagem);
    }

    const validacaoPeriodo = this.validarPeriodoPrescricao(dados.prescricaoId, dataHora);
    if (!validacaoPeriodo.valido) {
      throw new ValidationError(validacaoPeriodo.mensagem);
    }

    const validacaoIntervalo = this.validarIntervaloDoses(dados.prescricaoId, dataHora);
    if (!validacaoIntervalo.valido) {
      throw new ValidationError(validacaoIntervalo.mensagem);
    }

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
      deletedAt: null,
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
      r => r.id === registroId && isActive(r)
    );

    if (!registro) {
      throw new NotFoundError('Registro de uso nao encontrado');
    }

    return registro;
  }

  findByPrescricao(prescricaoId) {
    return database.registrosUso
      .filter(r => r.prescricaoId === prescricaoId && isActive(r))
      .map(r => ({
        ...r,
        prescricao: PrescricaoService.findById(prescricaoId),
      }));
  }

  findByUsuario(usuarioId, userType) {
    const filtro = userType === 'ADMIN'
      ? r => isActive(r)
      : r => {
          const prescricao = PrescricaoService.findById(r.prescricaoId);
          return isActive(r) && prescricao.usuarioId === usuarioId;
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
      .filter(isActive)
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
    registro.deletedAt = new Date();

    return { mensagem: 'Registro de uso deletado com sucesso', deletedAt: registro.deletedAt };
  }
}

module.exports = new RegistroUsoService();
