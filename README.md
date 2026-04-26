# MedControl API

API REST para gerenciamento de pacientes, medicamentos, prescricoes e registros de uso.

O projeto usa Node.js, Express, JWT, Swagger e dados em memoria. A estrutura foi mantida simples para fins de portfolio.

## Requisitos

- Node.js
- npm

## Instalacao

```bash
npm install
```

## Como executar

Ambiente de desenvolvimento:

```bash
npm run dev
```

Ambiente simples com Node:

```bash
npm start
```

URLs principais:

- API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs

## Scripts disponiveis

```bash
npm install
npm run dev
npm start
npm test
npm run test:unit
npm run test:integration
npm run test:watch
```

## Autenticação e Autorização

A API utiliza JWT para autenticação. Todos os endpoints (exceto login) requerem um token válido no header `Authorization: Bearer <token>`.

### Como fazer login

Envie uma requisição POST para `/auth/login` com email e senha:

```json
{
  "email": "admin@medcontrol.com",
  "senha": "admin123"
}
```

Resposta de sucesso:

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Usando o token

Inclua o token no header de todas as requisições subsequentes:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Perfis de usuário

- **ADMIN**: Pode criar, editar, excluir e visualizar tudo.
- **USER**: Pode visualizar apenas seus próprios dados e criar registros para si mesmo. Não pode criar, editar ou excluir.

### Exemplo de requisição autenticada

```bash
curl -X GET "http://localhost:3000/api/medicamentos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Rotas principais

Autenticação:

- `POST /auth/login`

Pacientes (Usuários):

- `POST /api/users/register` (ADMIN)
- `GET /api/users` (ADMIN)
- `GET /api/users/profile`
- `PUT /api/users/:id` (ADMIN)
- `DELETE /api/pacientes/:id` (ADMIN)

Medicamentos:

- `GET /api/medicamentos`
- `GET /api/medicamentos/:id`
- `POST /api/medicamentos` (ADMIN)
- `PUT /api/medicamentos/:id` (ADMIN)
- `DELETE /api/medicamentos/:id` (ADMIN)

Prescricoes:

- `GET /api/prescricoes` (ADMIN)
- `GET /api/prescricoes/:id`
- `GET /api/prescricoes/usuario/:usuarioId`
- `POST /api/prescricoes`
- `PUT /api/prescricoes/:id`
- `DELETE /api/prescricoes/:id`

Registros de uso:

- `GET /api/registros-uso` (ADMIN)
- `GET /api/registros-uso/:id`
- `GET /api/registros-uso/prescricao/:prescricaoId`
- `GET /api/registros-uso/usuario/:usuarioId`
- `POST /api/registros-uso`
- `POST /api/registros-uso`
- `DELETE /api/registros-uso/:id`

## Soft delete

As exclusoes usam soft delete. Os registros nao sao removidos fisicamente da memoria; eles recebem `deletedAt` e deixam de aparecer nas listagens padrao.

Regras aplicadas:

- Paciente com historico de uso nao pode ser deletado.
- Medicamento com prescricao ativa nao pode ser deletado.
- Prescricao ativa nao pode ser deletada.
- Registro de uso pode ser deletado quando existir.

## Estrutura

```text
src/
  controllers/
  services/
  models/
  routes/
  middlewares/
  config/
    swagger.js
  app.js
  server.js

tests/
  integracao/
    auth.test.js
    paciente.test.js
    medicacao.test.js
    prescricao.test.js
    registroDeUso.test.js
  unitarios/
    MedicamentoService.test.js
    PrescricaoService.test.js
    RegistroUsoService.test.js
    UserService.test.js
```

## Testes

Os testes usam Jest e Supertest.

Executar todos os testes:

```bash
npm test
```

Executar apenas testes de integracao:

```bash
npm run test:integration
```

Executar apenas testes unitarios:

```bash
npm run test:unit
```

Executar em modo watch:

```bash
npm run test:watch
```

Os testes de integracao importam `src/app.js` diretamente, entao nao e necessario subir o servidor manualmente para testa-los.

## Cobertura dos testes de integracao

- Autenticacao e autorizacao
- Status HTTP `200`, `201`, `400`, `401`, `403` e `404`
- Criacao e listagem de pacientes
- Criacao e exclusao de medicamentos
- Criacao de prescricoes
- Validacao de dose obrigatoria, medicamento obrigatorio e dose zero
- Validacao de frequencia conforme intervalo minimo
- Registro de uso respeitando intervalo entre doses
- Bloqueio de registro antes do intervalo minimo
- Validacao de dose maxima diaria
- Alerta ao atingir pelo menos 80% da dose maxima diaria
- Validacao do periodo da prescricao
- Bloqueio de registro duplicado no mesmo horario
- Interacao medicamentosa com alerta detalhado
- Soft delete e ocultacao em listagens padrao

## Variaveis de ambiente

Use `.env.example` como base:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-muito-segura-mude-em-producao
JWT_EXPIRATION=24h
```
