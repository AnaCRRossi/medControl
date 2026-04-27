const MedicamentoService = require('../../src/services/MedicamentoService');

async function createMedication(name, minIntervalHours, maxDailyDose, unidade = 'mg') {
  return await MedicamentoService.create({
    nome: name,
    intervaloMinimoHoras: minIntervalHours,
    doseMáximaDiaria: maxDailyDose,
    unidade
  });
}

async function createDipirona() {
  return await createMedication('Dipirona', 6, 3000);
}

async function createAspirina() {
  return await createMedication('Aspirina', 4, 2000);
}

module.exports = {
  createMedication,
  createDipirona,
  createAspirina
};