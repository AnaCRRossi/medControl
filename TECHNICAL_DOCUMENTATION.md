# Documentação Técnica - MedControl API

## 📐 Arquitetura

A aplicação segue a arquitetura **MVC (Model-View-Controller)** com uma camada adicional de **Services** para lógica de negócio:

```
Request
   ↓
[Routes] - Define endpoints
   ↓
[Middlewares] - Autenticação, Autorização, Validação
   ↓
[Controllers] - Orquestra requisição/resposta
   ↓
[Services] - Lógica de negócio
   ↓
[Database] - Persistência de dados
```

## 🗂️ Estrutura de Diretórios

### `/src/config`
Configurações centralizadas da aplicação:
- **config.js**: Variáveis de ambiente e configurações

### `/src/database`
Camada de persistência:
- **database.js**: Singleton com armazenamento em memória

### `/src/models`
Estruturas de dados (esquemas lógicos)
- Não contém código neste projeto (usar como referência)

### `/src/controllers`
Controladores que orquestram requisições:
- Recebem input do usuário
- Chamam services
- Retornam resposta formatada

### `/src/services`
Lógica de negócio concentrada:
- **UserService**: Operações de usuários (CRUD, login)
- **MedicamentoService**: Gerenciamento de medicamentos
- **PrescricaoService**: Prescrições com validações complexas
- **RegistroUsoService**: Registros com validações de regras de negócio

### `/src/routes`
Definição de rotas e endpoints:
- Mapeiam URLs para controladores
- Aplicam middlewares de validação
- Definem métodos HTTP

### `/src/middlewares`
Camada intermediária de processamento:
- **auth.js**: Validação de JWT
- **authorization.js**: Controle de acesso por role
- **errorHandler.js**: Tratamento centralizado de erros
- **validation.js**: Validações de entrada

### `/src/utils`
Funções auxiliares reutilizáveis:
- **auth.js**: Geração/verificação de JWT
- **errors.js**: Classes customizadas de erro
- **response.js**: Formatação padronizada de respostas
- **validators.js**: Funções de validação

## 🔐 Camada de Segurança

### Autenticação

A autenticação é baseada em **JWT (JSON Web Token)**:

```javascript
// Header deve conter:
Authorization: Bearer <token>

// Token contém:
{
  userId: "uuid",
  userType: "ADMIN" | "USER",
  iat: timestamp,
  exp: timestamp
}
```

**Fluxo de Autenticação:**
1. Usuário faz login com email/senha
2. Server valida credenciais
3. Server gera JWT
4. Cliente inclui JWT em requisições subsequentes
5. Server valida JWT antes de processar requisição

### Autorização

Controle de acesso por tipo de usuário:

- **ADMIN**: Acesso total a todos os endpoints
- **USER**: Acesso limitado aos seus próprios dados

Implementado via middleware `authorize()` que valida `req.user.type`.

## 💡 Decisões de Design

### 1. Soft Delete
Implementado para manter histórico e referential integrity:
```javascript
// Ao invés de remover registro:
DELETE FROM users WHERE id = '123';

// Marcamos como deletado:
UPDATE users SET deleted = true WHERE id = '123';
```

### 2. Armazenamento em Memória
Para demonstração/testes. Recomendado para produção:
- PostgreSQL com Sequelize
- MongoDB com Mongoose
- SQLite com better-sqlite3

### 3. UUID
Identificadores únicos por:
- Distribuição (sem SPOF)
- Segurança (não sequencial)
- Sincronização de banco de dados

### 4. Serviços Concentrados
Lógica de negócio em única classe:
- Facilita testes
- Reutilização entre controllers
- Manutenção centralizada

## 🧪 Estratégia de Testes

### Estrutura

```
tests/
├── unit/
│   ├── UserService.test.js
│   ├── MedicamentoService.test.js
│   ├── PrescricaoService.test.js
│   └── RegistroUsoService.test.js
└── integration/
    ├── users.test.js
    ├── medicamentos.test.js
    └── prescricoes.test.js
```

### Padrões

**Testes Unitários:**
- Testam serviços isoladamente
- Usam `jest`
- Não dependem de HTTP

**Testes de Integração:**
- Testam endpoints completos
- Usam `supertest`
- Simulam requisições HTTP

## 📋 Regras de Negócio Validadas

### Prescrição
```javascript
// ✅ Validações implementadas
- medicamento obrigatório
- dosagem > 0
- frequência formato válido
- frequência >= intervalo mínimo medicamento
- dataFim > dataInicio
- detecção de interações medicamentosas
- sem sobreposição de prescrições
```

### Registro de Uso
```javascript
// ✅ Validações implementadas
- prescrição válida e não deletada
- intervalo >= intervalo mínimo medicamento
- soma diária <= dose máxima diária
- alerta em 80% dose máxima
- data dentro do período prescrição
- sem duplicatas no mesmo horário
```

### Acesso
```javascript
// ✅ Implementado
- ADMIN: acesso total
- USER: apenas próprios dados
- Validação em cada endpoint
```

## 🚨 Tratamento de Erros

### Hierarquia de Erros

```javascript
                     Error (nativo)
                        ↓
                     ApiError
                    ↙ ↓ ↓ ↓ ↖
                   /  | | |  \
        Validation  Not- Unauthorized Forbidden Conflict
        Error      Found Error      Error    Error
        (400)      (404)  (401)      (403)    (409)
```

### Formato de Resposta

```javascript
// Sucesso
{
  "success": true,
  "message": "Descrição",
  "data": { ... }
}

// Erro
{
  "success": false,
  "message": "Descrição do erro",
  "error": "NomeDoErro"
}
```

## 📊 Fluxos Principais

### Criar Prescrição

```
1. POST /api/prescricoes
   ↓
2. Autenticação JWT
   ↓
3. Parsear body JSON
   ↓
4. Validar campos obrigatórios
   ↓
5. Buscar medicamento
   ↓
6. Verificar compatibilidade frequência/intervalo
   ↓
7. Detectar interações medicamentosas
   ↓
8. Verificar sobreposição
   ↓
9. Salvar prescrição em memória
   ↓
10. Retornar com alertas (se houver)
```

### Registrar Uso

```
1. POST /api/registros-uso
   ↓
2. Autenticação JWT
   ↓
3. Validar prescrição existe
   ↓
4. Validar intervalo entre doses
   ↓
5. Validar dose máxima diária
   ↓
6. Validar período prescrição
   ↓
7. Validar duplicidade
   ↓
8. Salvar registro
   ↓
9. Retornar com alertas (se houver)
```

## 🔧 Extensões Futuras

### 1. Banco de Dados Relacional
```javascript
// Implementar com PostgreSQL
const sequelize = require('sequelize');
const db = new sequelize.Sequelize(/* config */);
```

### 2. Cache
```javascript
// Redis para cache de medicamentos
const redis = require('redis');
const cache = redis.createClient();
```

### 3. Notificações
```javascript
// WebSocket para alertas em tempo real
const Socket = require('socket.io');
io.on('connection', (socket) => { /* ... */ });
```

### 4. Logging
```javascript
// Winston para logs estruturados
const logger = require('winston');
logger.info('Prescrição criada', { id, usuarioId });
```

### 5. Documentação Automática
```javascript
// Swagger/OpenAPI
const swaggerUi = require('swagger-ui-express');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
```

## 🎓 Padrões Utilizados

### Pattern: Singleton
```javascript
// database.js exporta única instância
class Database { /* ... */ }
module.exports = new Database();
```

### Pattern: Service Layer
```javascript
// Lógica concentrada em serviços
class UserService {
  create() { /* ... */ }
  findById() { /* ... */ }
}
```

### Pattern: Middleware Chain
```javascript
// Express aplica middlewares sequencialmente
app.use(authenticateToken);
app.use(authorize('ADMIN'));
app.post('/admin', handler);
```

### Pattern: Factory
```javascript
// Funções criam objetos com estado
function generateToken(userId) { /* ... */ }
```

## 📈 Performance

### Considerações

- **Busca Linear**: O(n) para cada lookup
- **Recomendação**: Índices em banco de dados
- **Cache**: Para medicamentos lidos frequentemente
- **Paginação**: Para listas grandes de registros

## 🛡️ Segurança

### Implementado
- ✅ JWT para autenticação
- ✅ Autorização por role
- ✅ Validação de entrada
- ✅ Tratamento de erros seguro

### Recomendado para Produção
- ⚠️ HTTPS obrigatório
- ⚠️ Rate limiting
- ⚠️ CORS configurado
- ⚠️ Helmet.js para headers HTTP
- ⚠️ Validação XSS/SQL Injection
- ⚠️ Hashing seguro de senhas (bcrypt)
- ⚠️ Auditing e logging

---

**Versão**: 1.0.0  
**Última Atualização**: Abril 2026
