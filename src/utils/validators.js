const { ValidationError } = require('./errors');

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validateRequired(value, fieldName) {
  if (!value || (typeof value === 'string' && !value.trim())) {
    throw new ValidationError(`${fieldName} é obrigatório`);
  }
}

function validateNumber(value, fieldName, options = {}) {
  if (typeof value !== 'number') {
    throw new ValidationError(`${fieldName} deve ser um número`);
  }
  
  if (options.min !== undefined && value < options.min) {
    throw new ValidationError(`${fieldName} deve ser maior ou igual a ${options.min}`);
  }
  
  if (options.max !== undefined && value > options.max) {
    throw new ValidationError(`${fieldName} deve ser menor ou igual a ${options.max}`);
  }
}

function validateString(value, fieldName, options = {}) {
  if (typeof value !== 'string') {
    throw new ValidationError(`${fieldName} deve ser uma string`);
  }
  
  if (options.minLength && value.length < options.minLength) {
    throw new ValidationError(`${fieldName} deve ter no mínimo ${options.minLength} caracteres`);
  }
  
  if (options.maxLength && value.length > options.maxLength) {
    throw new ValidationError(`${fieldName} deve ter no máximo ${options.maxLength} caracteres`);
  }
}

function validateEnum(value, fieldName, allowedValues) {
  if (!allowedValues.includes(value)) {
    throw new ValidationError(
      `${fieldName} deve ser um dos seguintes valores: ${allowedValues.join(', ')}`
    );
  }
}

function validateDate(value, fieldName) {
  const date = new Date(value);
  if (isNaN(date.getTime())) {
    throw new ValidationError(`${fieldName} deve ser uma data válida`);
  }
  return date;
}

module.exports = {
  validateEmail,
  validateRequired,
  validateNumber,
  validateString,
  validateEnum,
  validateDate,
};
