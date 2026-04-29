# MedControl API

API REST completa para controle de medicamentos, prescrições e registros de uso médico.

O projeto utiliza Node.js, Express, Prisma ORM com SQLite, JWT para autenticação, Swagger para documentação e Jest para testes. Desenvolvido com foco em segurança, validações de negócio complexas e boa arquitetura.

## 🚀 Tecnologias Utilizadas

- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **Prisma ORM** - ORM para banco de dados
- **SQLite** - Banco de dados
- **JWT** - Autenticação e autorização
- **bcryptjs** - Hash de senhas
- **Swagger** - Documentação interativa da API
- **Jest** - Framework de testes
- **Supertest** - Testes de integração

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd medcontrol
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
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

4. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

5. Execute o seed para criar dados iniciais:
```bash
npx prisma db seed
```

## 🚀 Executando a Aplicação

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

A API estará disponível em: `http://localhost:3000`

## 📚 Documentação da API

A documentação completa da API está disponível via Swagger UI em:
**http://localhost:3000/api-docs**

### Funcionalidades Documentadas

#### 🔐 Autenticação
- `POST /auth/login` - Login e geração de token JWT
- `POST /auth/register` - Registro de novos usuários (ADMIN)

#### 👥 Usuários
- `GET /api/users/profile` - Perfil do usuário autenticado
- `POST /api/users/register` - Registrar novo usuário (ADMIN)
- `GET /api/users` - Listar todos os usuários (ADMIN)
- `PUT /api/users/{id}` - Atualizar usuário (ADMIN)
- `DELETE /api/users/{id}` - Remover usuário (ADMIN)

#### 💊 Medicamentos
- `GET /api/medicamentos` - Listar medicamentos
- `POST /api/medicamentos` - Criar medicamento (ADMIN)
- `GET /api/medicamentos/{id}` - Detalhes do medicamento
- `PUT /api/medicamentos/{id}` - Atualizar medicamento (ADMIN)
- `DELETE /api/medicamentos/{id}` - Remover medicamento (ADMIN)

#### 📋 Prescrições
- `POST /api/prescricoes` - Criar prescrição
- `GET /api/prescricoes` - Listar prescrições (ADMIN)
- `GET /api/prescricoes/usuario/{usuarioId}` - Prescrições do usuário
- `GET /api/prescricoes/{id}` - Detalhes da prescrição
- `PUT /api/prescricoes/{id}` - Atualizar prescrição
- `DELETE /api/prescricoes/{id}` - Remover prescrição

#### 📝 Registros de Uso
- `POST /api/registros-uso` - Registrar uso de medicamento
- `GET /api/registros-uso` - Listar registros (ADMIN)
- `GET /api/registros-uso/prescricao/{prescricaoId}` - Registros por prescrição
- `GET /api/registros-uso/usuario/{usuarioId}` - Registros por usuário
- `GET /api/registros-uso/{id}` - Detalhes do registro
- `PUT /api/registros-uso/{id}` - Atualizar registro
- `DELETE /api/registros-uso/{id}` - Remover registro

### 🔑 Autenticação JWT

Para acessar endpoints protegidos, inclua o token JWT no header:
```
Authorization: Bearer <seu-token-jwt>
```

### 👤 Roles e Permissões

- **ADMIN**: Acesso completo a todas as funcionalidades
- **USER**: Acesso limitado às próprias prescrições e registros

### ⚠️ Regras de Negócio

#### Medicamentos
- **Intervalo mínimo**: Respeita o intervalo mínimo entre doses
- **Dose máxima diária**: Controla a dose máxima permitida por dia

#### Prescrições
- **Interações medicamentosas**: Verifica interações entre medicamentos
- **Período de validade**: Controla datas de início e fim da prescrição
- **Frequência**: Valida frequência de administração

#### Registros de Uso
- **Intervalo entre doses**: Garante intervalo mínimo entre administrações
- **Dose máxima diária**: Monitora consumo diário
- **Período da prescrição**: Valida se está dentro do período ativo

## 🧪 Testes

### Executar todos os testes
```bash
npm test
```

### Executar testes com cobertura
```bash
npm run test:coverage
```

### Executar testes de integração
```bash
npm run test:integration
```

## 📊 Estrutura do Projeto

```
medcontrol/
├── src/
│   ├── config/
│   │   └── swagger.js          # Configuração Swagger
│   ├── controllers/            # Controladores da API
│   ├── middlewares/            # Middlewares personalizados
│   ├── models/                 # Modelos de dados
│   ├── routes/                 # Definição das rotas
│   ├── services/               # Lógica de negócio
│   ├── app.js                  # Configuração Express
│   └── server.js               # Inicialização do servidor
├── prisma/
│   ├── schema.prisma           # Schema do banco de dados
│   └── seed.js                 # Dados iniciais
├── tests/                      # Testes unitários e integração
├── package.json
├── jest.config.js
└── README.md
```

## 🔒 Segurança

- Autenticação JWT com expiração configurável
- Hash de senhas com bcrypt
- Autorização baseada em roles (ADMIN/USER)
- Validações de entrada de dados
- Tratamento de erros consistente

## 📈 Monitoramento

- Logs estruturados
- Tratamento de erros centralizado
- Validações de negócio com alertas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte, entre em contato:
- Email: suporte@medcontrol.com
- Documentação: http://localhost:3000/api-docs

---

**Desenvolvido com ❤️ para controle seguro de medicamentos**

4. Configure o banco de dados:
```bash
# Gerar o cliente Prisma
npx prisma generate

# Executar migrações
npx prisma migrate dev --name init

# Popular banco com dados iniciais
npm run seed
```

## 🌱 Dados Iniciais (Seed)

O projeto inclui um script de seed que popula o banco com dados de exemplo:

- **Usuário Admin**: `admin@email.com` / `123456`
- **Paciente**: Carol (30 anos)
- **Medicamento**: Ibuprofeno (4000mg/dia, 8h intervalo)
- **Prescrição**: Exemplo de prescrição ativa
- **Registro de Uso**: Exemplo de uso registrado

Para executar o seed:
```bash
npm run seed
```

Ou via Prisma CLI:
```bash
npx prisma db seed
```

## ▶️ Como Executar

### Ambiente de Desenvolvimento
```bash
npm run dev
```

### Ambiente de Produção
```bash
npm start
```

A API estará disponível em:
- **API**: http://localhost:3000
- **Documentação Swagger**: http://localhost:3000/api-docs

## 📊 Banco de Dados

O projeto utiliza **SQLite** com **Prisma ORM** para persistência de dados.

### Comandos Úteis

```bash
# Visualizar schema do banco
npx prisma studio

# Executar migrações
npx prisma migrate dev

# Resetar banco de dados
npx prisma migrate reset

# Popular com dados de exemplo
npm run seed
```

### Estrutura das Tabelas

- **User**: Usuários do sistema (ADMIN/USER)
- **Patient**: Pacientes vinculados a usuários
- **Medication**: Medicamentos cadastrados
- **Prescription**: Prescrições médicas
- **UsageRecord**: Registros de uso dos medicamentos

## 🧪 Testes

O projeto possui cobertura completa de testes com **Jest** e **Supertest**.

### Scripts de Teste

```bash
# Executar todos os testes
npm test

# Executar apenas testes unitários
npm run test:unit

# Executar apenas testes de integração
npm run test:integration

# Executar testes de segurança
npm run test:security

# Executar em modo watch
npm run test:watch
```

### Estrutura dos Testes

```
tests/
├── integracao/          # Testes de integração (endpoints)
│   ├── auth.test.js
│   ├── medicacao.test.js
│   ├── paciente.test.js
│   ├── prescricao.test.js
│   └── registroDeUso.test.js
├── security/            # Testes de segurança
│   ├── auth.test.js     # Autenticação JWT
│   ├── authorization.test.js  # Autorização por perfil
│   └── accessControl.test.js  # Controle de acesso
└── unitarios/           # Testes unitários (services)
    ├── MedicamentoService.test.js
    ├── PrescricaoService.test.js
    ├── RegistroUsoService.test.js
    └── UserService.test.js
```

### Cobertura dos Testes

- ✅ **Autenticação**: JWT, tokens inválidos/malformados
- ✅ **Autorização**: Controle de acesso por perfil (ADMIN/USER)
- ✅ **Controle de Acesso**: Usuários acessam apenas seus dados
- ✅ **Validações de Negócio**: Doses, frequências, interações medicamentosas
- ✅ **Soft Delete**: Exclusões lógicas
- ✅ **Status HTTP**: 200, 201, 400, 401, 403, 404
- ✅ **Integração**: Fluxos completos da API

## 🔐 Autenticação e Autorização

A API utiliza JWT para autenticação. Todos os endpoints (exceto login) requerem um token válido no header `Authorization: Bearer <token>`.

### Como fazer login

Envie uma requisição POST para `/auth/login` com email e senha:

```json
{
  "email": "admin@email.com",
  "senha": "123456"
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

- **ADMIN**: Pode criar, editar, excluir e visualizar tudo
- **USER**: Pode visualizar apenas seus próprios dados e criar registros para si mesmo. Não pode criar, editar ou excluir

### Exemplo de requisição autenticada

```bash
curl -X GET "http://localhost:3000/api/medicamentos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 📡 Rotas Principais

### Autenticação
- `POST /auth/login`

### Usuários/Pacientes
- `POST /api/users/register` (ADMIN)
- `GET /api/users` (ADMIN)
- `GET /api/users/profile`
- `PUT /api/users/:id` (ADMIN)
- `DELETE /api/users/:id` (ADMIN)

### Medicamentos
- `GET /api/medicamentos`
- `GET /api/medicamentos/:id`
- `POST /api/medicamentos` (ADMIN)
- `PUT /api/medicamentos/:id` (ADMIN)
- `DELETE /api/medicamentos/:id` (ADMIN)

### Prescrições
- `GET /api/prescricoes` (ADMIN)
- `GET /api/prescricoes/:id`
- `GET /api/prescricoes/usuario/:usuarioId`
- `POST /api/prescricoes`
- `PUT /api/prescricoes/:id`
- `DELETE /api/prescricoes/:id`

### Registros de Uso
- `GET /api/registros-uso` (ADMIN)
- `GET /api/registros-uso/:id`
- `GET /api/registros-uso/prescricao/:prescricaoId`
- `GET /api/registros-uso/usuario/:usuarioId`
- `POST /api/registros-uso`
- `DELETE /api/registros-uso/:id`

## 🗂️ Estrutura do Projeto

```
medcontrol/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   ├── seed.js           # Script de seed
│   └── migrations/       # Migrações do banco
├── src/
│   ├── controllers/      # Controladores da API
│   ├── services/         # Lógica de negócio
│   ├── models/           # Modelos e validações
│   ├── routes/           # Definição das rotas
│   ├── middlewares/      # Middlewares (auth, role, etc.)
│   ├── config/
│   │   └── swagger.js    # Configuração do Swagger
│   ├── app.js            # Configuração do Express
│   └── server.js         # Inicialização do servidor
├── tests/                # Testes automatizados
│   ├── integracao/
│   ├── security/
│   └── unitarios/
├── .env                  # Variáveis de ambiente
├── .env.example          # Exemplo de variáveis
├── jest.config.js        # Configuração do Jest
├── package.json          # Dependências e scripts
└── README.md             # Este arquivo
```

## 🔄 Soft Delete

As exclusões usam soft delete. Os registros não são removidos fisicamente do banco; eles recebem `deletedAt` e deixam de aparecer nas listagens padrão.

Regras aplicadas:
- Paciente com histórico de uso não pode ser deletado
- Medicamento com prescrição ativa não pode ser deletado
- Prescrição ativa não pode ser deletada
- Registro de uso pode ser deletado quando existir

## 📝 Scripts Disponíveis

```bash
npm install          # Instalar dependências
npm start            # Executar em produção
npm run dev          # Executar em desenvolvimento
npm test             # Executar todos os testes
npm run test:unit    # Executar testes unitários
npm run test:integration  # Executar testes de integração
npm run test:security     # Executar testes de segurança
npm run test:watch   # Executar testes em modo watch
npm run seed         # Popular banco com dados iniciais
```
---

Para mais informações, consulte a [documentação da API](http://localhost:3000/api-docs) após iniciar o servidor.

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

```
medcontrol/
├── prisma/
│   ├── schema.prisma      # Schema do banco de dados
│   ├── seed.js           # Script de seed
│   └── migrations/       # Migrações do banco
├── src/
│   ├── controllers/      # Controladores da API
│   ├── services/         # Lógica de negócio
│   ├── models/           # Modelos e validações
│   ├── routes/           # Definição das rotas
│   ├── middlewares/      # Middlewares (auth, role, etc.)
│   ├── config/
│   │   └── swagger.js    # Configuração do Swagger
│   ├── app.js            # Configuração do Express
│   └── server.js         # Inicialização do servidor
├── tests/                # Testes automatizados
│   ├── integracao/       # Testes de integração
│   ├── security/         # Testes de segurança
│   └── unitarios/        # Testes unitários
├── .env                  # Variáveis de ambiente
├── .env.example          # Exemplo de variáveis
├── jest.config.js        # Configuração do Jest
├── package.json          # Dependências e scripts
└── README.md             # Este arquivo
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

### Cobertura dos Testes

- ✅ **Autenticação**: JWT, tokens inválidos/malformados
- ✅ **Autorização**: Controle de acesso por perfil (ADMIN/USER)
- ✅ **Controle de Acesso**: Usuários acessam apenas seus dados
- ✅ **Validações de Negócio**: Doses, frequências, interações medicamentosas
- ✅ **Soft Delete**: Exclusões lógicas
- ✅ **Status HTTP**: 200, 201, 400, 401, 403, 404
- ✅ **Integração**: Fluxos completos da API

## 🌍 Variáveis de Ambiente

Use `.env.example` como base:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-muito-segura-mude-em-producao
JWT_EXPIRATION=1h
DATABASE_URL="file:./dev.db"
```
