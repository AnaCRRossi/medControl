# MedControl API

API REST completa para controle de medicamentos, prescrições e registros de uso médico.

O projeto utiliza **Node.js**, **Express**, **Prisma ORM** com **SQLite**, **JWT** para autenticação, **Swagger/OpenAPI** para documentação e **Jest** para testes. Desenvolvido com foco em segurança, validações de negócio complexas e boa arquitetura.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript (v18+)
- **Express.js** - Framework web
- **Prisma ORM** - ORM para banco de dados
- **SQLite** - Banco de dados
- **JWT** - Autenticação e autorização
- **bcryptjs** - Hash de senhas
- **Swagger/OpenAPI 3.0** - Documentação interativa da API
- **Jest** - Framework de testes
- **Supertest** - Testes de integração HTTP
- **Nodemon** - Hot reload em desenvolvimento

## 📋 Pré-requisitos

- **Node.js** versão 18 ou superior
- **npm** ou **yarn** (npm vem com Node.js)
- Acesso ao terminal/prompt de comando

## 🔧 Instalação Completa

### 1. Clone o repositório

```bash
git clone <repository-url>
cd medcontrol
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-muito-segura-mude-em-producao
JWT_EXPIRATION=1h
DATABASE_URL="file:./dev.db"
```

**Importante:** Para produção, altere `JWT_SECRET` para uma chave segura.

### 4. Configure o banco de dados

```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev
```

### 5. Popular o banco com dados iniciais (opcional)

```bash
npm run seed
```

Dados de exemplo criados:
- **Usuário Admin**: `admin@email.com` / `123456`
- **Paciente**: Carol (30 anos)
- **Medicamento**: Ibuprofeno (4000mg/dia, intervalo 8h)
- **Prescrição**: Exemplo de prescrição ativa
- **Registro de Uso**: Exemplo de uso registrado

## ▶️ Executando a Aplicação

### Desenvolvimento (com hot reload)

```bash
npm run dev
```

A API estará disponível em: **http://localhost:3000**

Se a porta 3000 estiver ocupada, você pode usar outra:

```bash
PORT=3001 npm run dev
```

### Produção

```bash
npm start
```

### Acessar a Documentação Swagger

Após iniciar a API, acesse a documentação interativa:

**http://localhost:3000/api-docs**

A documentação permite testar todos os endpoints diretamente no navegador.

## 🧪 Testes

O projeto possui testes unitários, de integração e de segurança.

### Executar todos os testes

```bash
npm test
```

### Executar apenas testes unitários

```bash
npm run test:unit
```

Testa os serviços isoladamente:
- `MedicamentoService`
- `UserService`
- `PrescricaoService`
- `RegistroUsoService`

### Executar apenas testes de integração

```bash
npm run test:integration
```

Testa os endpoints completos:
- Autenticação (login/register)
- Medicamentos
- Pacientes
- Prescrições
- Registros de Uso

### Executar apenas testes de segurança

```bash
npm run test:security
```

Testa:
- Autenticação JWT
- Autorização por perfil (ADMIN/USER)
- Controle de acesso

### Executar testes em modo watch

```bash
npm run test:watch
```

Monitora mudanças e re-executa os testes automaticamente.

### Cobertura de testes

```bash
npm run test:coverage
```

Gera relatório de cobertura em `coverage/lcov-report/index.html`

## 📚 Documentação da API / Swagger

A documentação completa está disponível em: **http://localhost:3000/api-docs**

### Principais Endpoints

#### 🔐 Autenticação

```bash
POST /auth/login                 # Login e geração de token JWT
```

**Exemplo de requisição:**

```json
{
  "email": "admin@email.com",
  "senha": "123456"
}
```

**Resposta de sucesso:**

```json
{
  "success": true,
  "message": "Login realizado com sucesso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "id": "...",
      "email": "admin@email.com",
      "nome": "Admin",
      "tipo": "ADMIN"
    }
  }
}
```

#### 👥 Usuários/Pacientes

```bash
POST   /api/users/register           # Criar novo usuário (ADMIN)
GET    /api/users                    # Listar usuários (ADMIN)
GET    /api/users/profile            # Perfil do usuário autenticado
PUT    /api/users/:id                # Atualizar usuário (ADMIN)
DELETE /api/users/:id                # Deletar usuário (ADMIN)

# Endpoints alternativos para pacientes:
POST   /api/pacientes                # Criar paciente (ADMIN)
GET    /api/pacientes                # Listar pacientes (ADMIN)
DELETE /api/pacientes/:id            # Deletar paciente (ADMIN)
```

#### 💊 Medicamentos

```bash
GET    /api/medicamentos             # Listar medicamentos
POST   /api/medicamentos             # Criar medicamento (ADMIN)
GET    /api/medicamentos/:id         # Detalhes do medicamento
PUT    /api/medicamentos/:id         # Atualizar medicamento (ADMIN)
DELETE /api/medicamentos/:id         # Deletar medicamento (ADMIN)
```

#### 📋 Prescrições

```bash
GET    /api/prescricoes              # Listar prescrições (ADMIN)
POST   /api/prescricoes              # Criar prescrição
GET    /api/prescricoes/:id          # Detalhes da prescrição
GET    /api/prescricoes/usuario/:usuarioId  # Prescrições do usuário
PUT    /api/prescricoes/:id          # Atualizar prescrição
DELETE /api/prescricoes/:id          # Deletar prescrição
```

#### 📝 Registros de Uso

```bash
GET    /api/registros-uso            # Listar registros (ADMIN)
POST   /api/registros-uso            # Registrar uso de medicamento
GET    /api/registros-uso/:id        # Detalhes do registro
GET    /api/registros-uso/prescricao/:prescricaoId  # Registros por prescrição
GET    /api/registros-uso/usuario/:usuarioId       # Registros por usuário
PUT    /api/registros-uso/:id        # Atualizar registro
DELETE /api/registros-uso/:id        # Deletar registro
```

## 🔐 Autenticação e Autorização

### Como fazer login

1. Faça uma requisição POST para `/auth/login` com email e senha
2. Você receberá um token JWT na resposta
3. Inclua este token em todas as requisições posteriores

### Usando o token JWT

Inclua o token no header `Authorization` de todas as requisições:

```bash
curl -X GET "http://localhost:3000/api/medicamentos" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Perfis de Usuário

- **ADMIN**: Acesso completo a todas as funcionalidades
- **USER**: Acesso limitado às próprias prescrições e registros de uso

### Exemplo com cURL

```bash
# 1. Fazer login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@email.com","senha":"123456"}'

# 2. Usar o token em outra requisição
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
curl -X GET http://localhost:3000/api/medicamentos \
  -H "Authorization: Bearer $TOKEN"
```

## ⚠️ Regras de Negócio

### Medicamentos

- **Intervalo mínimo**: Respeita o intervalo mínimo entre doses
- **Dose máxima diária**: Controla a dose máxima permitida por dia

### Prescrições

- **Interações medicamentosas**: Verifica interações entre medicamentos
- **Período de validade**: Controla datas de início e fim da prescrição
- **Frequência**: Valida frequência de administração

### Registros de Uso

- **Intervalo entre doses**: Garante intervalo mínimo entre administrações
- **Dose máxima diária**: Monitora consumo diário
- **Período da prescrição**: Valida se está dentro do período ativo

## 🗂️ Estrutura do Projeto

```
medcontrol/
├── src/
│   ├── config/
│   │   └── swagger.js              # Configuração Swagger/OpenAPI
│   ├── controllers/
│   │   ├── auth.controller.js      # Autenticação
│   │   ├── MedicamentoController.js
│   │   ├── PrescricaoController.js
│   │   ├── RegistroUsoController.js
│   │   ├── UserController.js
│   │   └── response.js             # Formatação de respostas
│   ├── middlewares/
│   │   ├── auth.middleware.js      # Verificação de JWT
│   │   ├── auth.js                 # Autenticação alternativa
│   │   ├── authorization.js        # Autorização
│   │   ├── errorHandler.js         # Tratamento de erros
│   │   └── role.middleware.js      # Validação de roles
│   ├── models/
│   │   ├── database.js             # Conexão com banco
│   │   ├── errors.js               # Classes de erro
│   │   └── validators.js           # Validações
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── medicamentos.js
│   │   ├── prescricoes.js
│   │   ├── registrosUso.js
│   │   └── users.js
│   ├── services/
│   │   ├── auth.service.js         # Lógica de autenticação
│   │   ├── authService.js          # Alternativa (compatibilidade)
│   │   ├── MedicamentoService.js
│   │   ├── PrescricaoService.js
│   │   ├── RegistroUsoService.js
│   │   └── UserService.js
│   ├── app.js                      # Configuração Express
│   └── server.js                   # Inicialização do servidor
├── prisma/
│   ├── schema.prisma               # Schema do banco de dados
│   ├── seed.js                     # Script de seed
│   └── migrations/                 # Histórico de migrações
├── tests/
│   ├── helpers/
│   │   ├── createMedication.js     # Helper para testes
│   │   ├── createUser.js           # Helper para testes
│   │   └── generateToken.js        # Geração de tokens para testes
│   ├── integracao/
│   │   ├── auth.test.js
│   │   ├── medicacao.test.js
│   │   ├── paciente.test.js
│   │   ├── prescricao.test.js
│   │   └── registroDeUso.test.js
│   ├── security/
│   │   ├── auth.test.js            # Testes de autenticação JWT
│   │   ├── authorization.test.js   # Testes de autorização
│   │   └── accessControl.test.js   # Testes de controle de acesso
│   ├── unitarios/
│   │   ├── MedicamentoService.test.js
│   │   ├── PrescricaoService.test.js
│   │   ├── RegistroUsoService.test.js
│   │   └── UserService.test.js
│   └── setup.js                    # Setup dos testes
├── coverage/                       # Relatório de cobertura
├── .env                            # Variáveis de ambiente (não versionado)
├── .env.example                    # Exemplo de variáveis
├── .gitignore                      # Arquivos ignorados pelo Git
├── jest.config.js                  # Configuração do Jest
├── package.json                    # Dependências e scripts
├── prisma.config.ts                # Configuração alternativa (compatibilidade)
└── README.md                       # Este arquivo
```

## 📊 Banco de Dados

O projeto utiliza **SQLite** com **Prisma ORM** para persistência de dados.

### Visualizar/Gerenciar banco de dados

```bash
# Abrir Prisma Studio (interface gráfica para o banco)
npx prisma studio
```

### Comandos úteis do Prisma

```bash
# Executar migrações
npx prisma migrate dev

# Resetar banco de dados (cuidado! apaga tudo)
npx prisma migrate reset

# Gerar client Prisma
npx prisma generate

# Ver histórico de migrações
npx prisma migrate status
```

### Estrutura das Tabelas Principais

- **User**: Usuários do sistema (ADMIN/USER)
- **Medication**: Medicamentos cadastrados
- **Prescription**: Prescrições médicas
- **UsageRecord**: Registros de uso dos medicamentos

## 🔄 Soft Delete

As exclusões usam **soft delete**. Os registros não são removidos fisicamente do banco; eles recebem um timestamp em `deletedAt` e deixam de aparecer nas listagens padrão.

## 🔒 Segurança

- ✅ Autenticação JWT com expiração configurável
- ✅ Hash de senhas com bcryptjs (10 rounds)
- ✅ Autorização baseada em roles (ADMIN/USER)
- ✅ Validações de entrada de dados
- ✅ Tratamento de erros centralizado
- ✅ Proteção contra SQL injection via Prisma
- ✅ Variáveis de ambiente para dados sensíveis

## 📝 Scripts Disponíveis

```bash
npm install              # Instalar dependências
npm start                # Executar em produção
npm run dev              # Executar em desenvolvimento com hot reload
npm test                 # Executar todos os testes
npm run test:unit        # Apenas testes unitários
npm run test:integration # Apenas testes de integração
npm run test:security    # Apenas testes de segurança
npm run test:watch       # Modo watch (re-executa ao mudar arquivos)
npm run test:coverage    # Testes com relatório de cobertura
npm run seed             # Popular banco com dados iniciais
```

## 🧪 Cobertura de Testes

O projeto possui testes para:

- ✅ **Autenticação**: JWT, tokens inválidos/malformados, expiração
- ✅ **Autorização**: Controle de acesso por perfil (ADMIN/USER)
- ✅ **Controle de Acesso**: Usuários acessam apenas seus dados
- ✅ **Validações de Negócio**: Doses, frequências, interações medicamentosas
- ✅ **Soft Delete**: Exclusões lógicas funcionando corretamente
- ✅ **Status HTTP**: 200, 201, 400, 401, 403, 404, 500
- ✅ **Integração**: Fluxos completos da API

## 🌍 Variáveis de Ambiente

O arquivo `.env` deve conter:

```env
# Servidor
PORT=3000                                        # Porta da API (padrão: 3000)
NODE_ENV=development                            # Ambiente (development/production)

# Autenticação JWT
JWT_SECRET=sua-chave-secreta-muito-segura      # ⚠️ Alterar em produção!
JWT_EXPIRATION=1h                               # Validade do token (ex: 1h, 7d)

# Banco de Dados
DATABASE_URL="file:./dev.db"                   # SQLite local para desenvolvimento
# DATABASE_URL="file:./prod.db"                # Para produção
```

## 📞 Suporte e Documentação

- **Documentação Swagger**: http://localhost:3000/api-docs
- **Testes**: Execute `npm test` para validar funcionamento
- **Logs**: Verifique o console para logs de erro e informações



