const validateUserRegister = (req, res, next) => {
  const { email, senha, nome } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Email é obrigatório e deve ser uma string',
    });
  }

  if (!senha || typeof senha !== 'string' || senha.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Senha é obrigatória e deve ter no mínimo 6 caracteres',
    });
  }

  if (!nome || typeof nome !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Nome é obrigatório e deve ser uma string',
    });
  }

  next();
};

const validatePrescricao = (req, res, next) => {
  const { medicamentoId, dosagem, frequencia, dataInicio, dataFim } = req.body;

  if (!medicamentoId) {
    return res.status(400).json({
      success: false,
      message: 'medicamentoId é obrigatório',
    });
  }

  if (!dosagem || typeof dosagem !== 'number' || dosagem <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Dosagem é obrigatória, deve ser um número e maior que zero',
    });
  }

  if (!frequencia || typeof frequencia !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Frequência é obrigatória (ex: "8h", "12h")',
    });
  }

  if (!dataInicio) {
    return res.status(400).json({
      success: false,
      message: 'Data de início é obrigatória',
    });
  }

  if (!dataFim) {
    return res.status(400).json({
      success: false,
      message: 'Data de fim é obrigatória',
    });
  }

  next();
};

const validateRegistroUso = (req, res, next) => {
  const { prescricaoId, dosagem, dataHora } = req.body;

  if (!prescricaoId) {
    return res.status(400).json({
      success: false,
      message: 'prescricaoId é obrigatório',
    });
  }

  if (!dosagem || typeof dosagem !== 'number' || dosagem <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Dosagem é obrigatória, deve ser um número e maior que zero',
    });
  }

  if (!dataHora) {
    return res.status(400).json({
      success: false,
      message: 'Data e hora são obrigatórias',
    });
  }

  next();
};

const validateMedicamento = (req, res, next) => {
  const { nome, intervaloMinimoHoras, doseMáximaDiaria, unidade } = req.body;

  if (!nome || typeof nome !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Nome é obrigatório e deve ser uma string',
    });
  }

  if (!intervaloMinimoHoras || typeof intervaloMinimoHoras !== 'number' || intervaloMinimoHoras <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Intervalo mínimo é obrigatório e deve ser um número maior que zero',
    });
  }

  if (!doseMáximaDiaria || typeof doseMáximaDiaria !== 'number' || doseMáximaDiaria <= 0) {
    return res.status(400).json({
      success: false,
      message: 'Dose máxima diária é obrigatória e deve ser um número maior que zero',
    });
  }

  if (!unidade || typeof unidade !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Unidade é obrigatória (ex: "mg", "ml", "g")',
    });
  }

  next();
};

module.exports = {
  validateUserRegister,
  validatePrescricao,
  validateRegistroUso,
  validateMedicamento,
};
