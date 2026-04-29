const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MedControl API',
      version: '1.0.0',
      description: 'API REST completa para controle de medicamentos, prescrições e registros de uso',
      contact: {
        name: 'Equipe MedControl',
        email: 'suporte@medcontrol.com',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor de desenvolvimento',
      },
      {
        url: 'https://api.medcontrol.com',
        description: 'Servidor de produção',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Descrição do erro',
            },
            error: {
              type: 'string',
              example: 'NomeDoErro',
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Operação realizada com sucesso',
            },
            data: {
              type: 'object',
              description: 'Dados retornados',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'usuario@exemplo.com',
            },
            nome: {
              type: 'string',
              example: 'João Silva',
            },
            tipo: {
              type: 'string',
              enum: ['ADMIN', 'USER'],
              example: 'USER',
            },
            dataCriacao: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-25T10:30:00Z',
            },
          },
        },
        Medicamento: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            nome: {
              type: 'string',
              example: 'Paracetamol',
            },
            descricao: {
              type: 'string',
              example: 'Analgésico e antipirético',
            },
            intervaloMinimoHoras: {
              type: 'number',
              example: 4,
            },
            doseMáximaDiaria: {
              type: 'number',
              example: 4000,
            },
            unidade: {
              type: 'string',
              example: 'mg',
            },
            dataCriacao: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-25T10:30:00Z',
            },
          },
        },
        Prescricao: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            usuarioId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            medicamentoId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            dosagem: {
              type: 'number',
              example: 500,
            },
            unidade: {
              type: 'string',
              example: 'mg',
            },
            frequencia: {
              type: 'string',
              example: '8h',
            },
            dataInicio: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-25T00:00:00Z',
            },
            dataFim: {
              type: 'string',
              format: 'date-time',
              example: '2026-05-25T00:00:00Z',
            },
            notasAdicionais: {
              type: 'string',
              example: 'Tomar após as refeições',
            },
            dataCriacao: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-25T10:30:00Z',
            },
            medicamento: {
              $ref: '#/components/schemas/Medicamento',
            },
            alertas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tipo: {
                    type: 'string',
                    example: 'INTERACAO_MEDICAMENTOSA',
                  },
                  mensagem: {
                    type: 'string',
                    example: 'Este medicamento possui interações',
                  },
                  detalhes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        medicamentos: {
                          type: 'array',
                          items: { type: 'string' },
                          example: ['Paracetamol', 'Ibuprofeno'],
                        },
                        nivelRisco: {
                          type: 'string',
                          enum: ['LOW', 'MEDIUM', 'HIGH'],
                          example: 'HIGH',
                        },
                        descricao: {
                          type: 'string',
                          example: 'Risco de toxicidade hepática aumentada',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        RegistroUso: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            prescricaoId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            dosagem: {
              type: 'number',
              example: 500,
            },
            dataHora: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-25T08:30:00Z',
            },
            notas: {
              type: 'string',
              example: 'Tomado com água',
            },
            dataCriacao: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-25T08:30:00Z',
            },
            prescricao: {
              $ref: '#/components/schemas/Prescricao',
            },
            alertas: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  tipo: {
                    type: 'string',
                    example: 'AVISO_DOSE_MAXIMA',
                  },
                  mensagem: {
                    type: 'string',
                    example: 'Atingidos 80% da dose máxima diária',
                  },
                  percentual: {
                    type: 'string',
                    example: '80.0',
                  },
                },
              },
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'senha'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@medcontrol.com',
            },
            senha: {
              type: 'string',
              example: 'admin123',
            },
          },
        },
        LoginResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: true,
            },
            message: {
              type: 'string',
              example: 'Login realizado com sucesso',
            },
            data: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                  example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                },
                usuario: {
                  $ref: '#/components/schemas/User',
                },
              },
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'senha', 'nome'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'novo@usuario.com',
            },
            senha: {
              type: 'string',
              example: 'senha123',
            },
            nome: {
              type: 'string',
              example: 'João Silva',
            },
            tipo: {
              type: 'string',
              enum: ['ADMIN', 'USER'],
              example: 'USER',
            },
          },
        },
        MedicamentoRequest: {
          type: 'object',
          required: ['nome', 'intervaloMinimoHoras', 'doseMáximaDiaria', 'unidade'],
          properties: {
            nome: {
              type: 'string',
              example: 'Dipirona',
            },
            descricao: {
              type: 'string',
              example: 'Analgésico e antipirético',
            },
            intervaloMinimoHoras: {
              type: 'number',
              example: 6,
            },
            doseMáximaDiaria: {
              type: 'number',
              example: 3000,
            },
            unidade: {
              type: 'string',
              example: 'mg',
            },
          },
        },
        PrescricaoRequest: {
          type: 'object',
          required: ['medicamentoId', 'dosagem', 'frequencia', 'dataInicio', 'dataFim'],
          properties: {
            medicamentoId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            dosagem: {
              type: 'number',
              example: 500,
            },
            frequencia: {
              type: 'string',
              example: '8h',
            },
            dataInicio: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-25T00:00:00Z',
            },
            dataFim: {
              type: 'string',
              format: 'date-time',
              example: '2026-05-25T00:00:00Z',
            },
            notasAdicionais: {
              type: 'string',
              example: 'Tomar após as refeições',
            },
          },
        },
        RegistroUsoRequest: {
          type: 'object',
          required: ['prescricaoId', 'dosagem', 'dataHora'],
          properties: {
            prescricaoId: {
              type: 'string',
              format: 'uuid',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            dosagem: {
              type: 'number',
              example: 500,
            },
            dataHora: {
              type: 'string',
              format: 'date-time',
              example: '2026-04-25T08:30:00Z',
            },
            notas: {
              type: 'string',
              example: 'Tomado com água',
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js'], // Caminhos para os arquivos que contêm as anotações
};

const specs = swaggerJSDoc(options);

module.exports = {
  swaggerUi,
  specs,
};
