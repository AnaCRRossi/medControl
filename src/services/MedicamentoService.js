require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { NotFoundError, ValidationError, ConflictError } = require('../models/errors');
const { validateRequired, validateNumber } = require('../models/validators');

const prisma = new PrismaClient();

const DOSE_MAXIMA_DIARIA_KEYS = [
  'doseMaximaDiaria',
  'doseM\u00e1ximaDiaria',
  'doseM\u00c3\u00a1ximaDiaria',
  'doseM\u00c3\u0083\u00c2\u00a1ximaDiaria',
];

function getDoseMaximaDiaria(item) {
  const key = DOSE_MAXIMA_DIARIA_KEYS.find(doseKey => item[doseKey] !== undefined);
  return key ? item[key] : undefined;
}

class MedicamentoService {
  async create(dados) {
    validateRequired(dados.nome, 'Nome');
    validateRequired(dados.unidade, 'Unidade');
    validateNumber(dados.intervaloMinimoHoras, 'intervaloMinimoHoras', { min: 1 });

    const doseMaximaDiaria = getDoseMaximaDiaria(dados);
    validateNumber(doseMaximaDiaria, 'doseMaximaDiaria', { min: 1 });

    const existente = await prisma.medication.findFirst({
      where: {
        name: dados.nome.toLowerCase(),
        deletedAt: null
      }
    });

    if (existente) {
      throw new ConflictError('Medicamento com este nome ja existe');
    }

    const novoMedicamento = await prisma.medication.create({
      data: {
        name: dados.nome.toLowerCase(),
        maxDailyDose: doseMaximaDiaria,
        minIntervalHours: dados.intervaloMinimoHoras,
      }
    });

    return novoMedicamento;
  }

  async findById(medicamentoId) {
    const medicamento = await prisma.medication.findFirst({
      where: {
        id: medicamentoId,
        deletedAt: null
      }
    });

    if (!medicamento) {
      throw new NotFoundError('Medicamento nao encontrado');
    }

    return medicamento;
  }

  async findAll() {
    return await prisma.medication.findMany({
      where: {
        deletedAt: null
      }
    });
  }

  async update(medicamentoId, dados) {
    const medicamento = await this.findById(medicamentoId);

    if (dados.nome && dados.nome !== medicamento.name) {
      const existente = await prisma.medication.findFirst({
        where: {
          name: dados.nome.toLowerCase(),
          id: { not: medicamentoId },
          deletedAt: null
        }
      });
      if (existente) {
        throw new ConflictError('Medicamento com este nome ja existe');
      }
    }

    const updateData = {};
    if (dados.nome) updateData.name = dados.nome.toLowerCase();
    if (dados.intervaloMinimoHoras !== undefined) {
      validateNumber(dados.intervaloMinimoHoras, 'intervaloMinimoHoras', { min: 1 });
      updateData.minIntervalHours = dados.intervaloMinimoHoras;
    }

    const doseMaximaDiaria = getDoseMaximaDiaria(dados);
    if (doseMaximaDiaria !== undefined) {
      validateNumber(doseMaximaDiaria, 'doseMaximaDiaria', { min: 1 });
      updateData.maxDailyDose = doseMaximaDiaria;
    }

    return await prisma.medication.update({
      where: { id: medicamentoId },
      data: updateData
    });
  }

  async delete(medicamentoId) {
    const medicamento = await this.findById(medicamentoId);

    const prescricoesAtivas = await prisma.prescription.findMany({
      where: {
        medicationId: medicamentoId,
        endDate: {
          gte: new Date()
        },
        startDate: {
          lte: new Date()
        },
        deletedAt: null
      }
    });

    if (prescricoesAtivas.length > 0) {
      throw new ValidationError('Nao e possivel deletar medicamento com prescricao ativa');
    }

    return await prisma.medication.update({
      where: { id: medicamentoId },
      data: { deletedAt: new Date() }
    });
  }
}

module.exports = new MedicamentoService();
module.exports.prisma = prisma;
