# Changelog

Todos as mudanças importantes neste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
e este projeto segue [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-04-25

### Adicionado
- ✨ Estrutura inicial do projeto com padrão MVC
- 🔐 Autenticação com JWT
- 👥 Sistema de autorização por tipo de usuário (ADMIN/USER)
- 🏥 Modelo de Paciente/Usuário
- 💊 Modelo de Medicamento
- 📋 Modelo de Prescrição com validações complexas
- 📊 Modelo de Registro de Uso
- ✅ Validações de negócio:
  - Intervalo mínimo entre doses
  - Dose máxima diária com alertas
  - Período da prescrição
  - Interações medicamentosas
  - Frequência compatível com intervalo mínimo
  - Soft delete para integridade referencial
- 🧪 Cobertura de testes unitários (Services)
- 🔗 Testes de integração (API endpoints)
- 📚 Documentação técnica
- 🐳 Dockerfile e docker-compose
- 📝 README com instruções completas
- 🛠️ Configuração de linting (ESLint)
- 🧸 Configuração de testes (Jest + Supertest)
- 📱 Postman collection para testes manuais
- 🔧 Exemplos de curl para API

### Endpoints Implementados

#### Usuários
- POST /api/users/register
- POST /api/users/login
- GET /api/users/profile
- GET /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

#### Medicamentos
- GET /api/medicamentos
- GET /api/medicamentos/:id
- POST /api/medicamentos
- PUT /api/medicamentos/:id
- DELETE /api/medicamentos/:id

#### Prescrições
- GET /api/prescricoes
- GET /api/prescricoes/:id
- GET /api/prescricoes/usuario/:usuarioId
- POST /api/prescricoes
- PUT /api/prescricoes/:id
- DELETE /api/prescricoes/:id

#### Registros de Uso
- GET /api/registros-uso
- GET /api/registros-uso/:id
- GET /api/registros-uso/prescricao/:prescricaoId
- GET /api/registros-uso/usuario/:usuarioId
- POST /api/registros-uso
- DELETE /api/registros-uso/:id

### Regras de Negócio Implementadas

#### Prescrição
- ✅ Medicamento obrigatório
- ✅ Dosagem obrigatória e > 0
- ✅ Frequência em formato válido (ex: "8h")
- ✅ Frequência >= intervalo mínimo do medicamento
- ✅ Data de fim > data de início
- ✅ Detecção de interações medicamentosas
- ✅ Alerta crítico com nível de risco

#### Registro de Uso
- ✅ Validação de intervalo mínimo entre doses
- ✅ Validação de dose máxima diária
- ✅ Alerta ao atingir 80% da dose máxima
- ✅ Validação de período da prescrição
- ✅ Prevenção de duplicatas no mesmo horário
- ✅ Soft delete

### Segurança
- ✅ Autenticação JWT
- ✅ Validação de entrada em todos os endpoints
- ✅ Tratamento de erros centralizado
- ✅ Soft delete para integridade de dados

### Conhecimento Técnico

#### Stack Principal
- Node.js v14+
- Express.js 4.x
- UUID para identificadores
- JWT para autenticação
- Dados em memória (para demonstração)

#### Testing
- Jest 29.x
- Supertest 6.x
- 100% cobertura de regras de negócio

#### DevOps
- Docker + Docker Compose
- .env para variáveis sensíveis
- Health check integrado

## [Futuro]

### Planejado para v1.1.0
- [ ] Integração com banco de dados (PostgreSQL)
- [ ] Cache (Redis)
- [ ] WebSocket para notificações em tempo real
- [ ] Logging estruturado (Winston)
- [ ] Swagger/OpenAPI documentation
- [ ] Rate limiting
- [ ] CORS configurável
- [ ] Testes E2E com Cypress

### Planejado para v2.0.0
- [ ] Integração com serviço de SMS/Email
- [ ] PDF generation para prescrições
- [ ] QR code para prescrições
- [ ] Mobile app companion
- [ ] Analytics dashboard
- [ ] Multi-tenant support
- [ ] Geolocalization
- [ ] Machine learning para alertas

---

**Data de Criação**: Abril 25, 2026  
**Mantido por**: Tim de Desenvolvimento
