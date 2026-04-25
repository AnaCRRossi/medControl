# Guia de Desenvolvimento Local

## 📝 Pré-requisitos

- Node.js v14+
- npm v6+
- Git
- Um editor de código (VS Code, WebStorm, etc)

## 🚀 Primeiros Passos

### 1. Clonar e Configurar

```bash
# Clone o repositório
git clone <url-repo>
cd medControl

# Instale as dependências
npm install

# Copie o arquivo de exemplo de variáveis
cp .env.example .env
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env`:

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=uma-chave-segura-para-desenvolvimento
JWT_EXPIRATION=24h
```

### 3. Iniciar o Servidor

#### Opção 1: Desenvolvimento com auto-reload
```bash
npm run dev
```

Isso inicia o servidor com `nodemon` que reinicia automaticamente quando você salva arquivos.

#### Opção 2: Produção
```bash
npm start
```

### 4. Verificar se está funcionando

```bash
# Abra outra aba do terminal
curl http://localhost:3000/health

# Deve retornar:
# {
#   "success": true,
#   "message": "API MedControl está funcionando",
#   "timestamp": "2026-04-25T..."
# }
```

## 🧪 Executando Testes

### Testes Unitários
```bash
npm run test:unit
```

### Testes de Integração
```bash
npm run test:integration
```

### Todos os Testes com Cobertura
```bash
npm test
```

### Modo Watch (executa testes ao salvar)
```bash
npm run test:watch
```

## 📁 Estrutura de Arquivos para Edição

Arquivos principais que você provavelmente editará:

```
src/
├── services/          ← Lógica de negócio (99% das mudanças)
│   ├── UserService.js
│   ├── MedicamentoService.js
│   ├── PrescricaoService.js
│   └── RegistroUsoService.js
├── controllers/       ← Orquestração (10% mudanças)
├── routes/           ← Endpoints (pequenas mudanças)
└── middlewares/      ← Autenticação/validação (raras mudanças)
```

## 🔄 Fluxo de Desenvolvimento Recomendado

### 1. Criar Novo Endpoint

```bash
# 1. Crie o método no serviço (src/services/xService.js)
# 2. Crie o método no controlador (src/controllers/xController.js)
# 3. Adicione a rota (src/routes/x.js)
# 4. Teste com curl ou Postman
# 5. Adicione testes (tests/unit/xService.test.js)
# 6. Adicione testes de integração (tests/integration/x.test.js)
```

### 2. Adicionar Validação

```javascript
// 1. Adicione função em src/utils/validators.js
function validateMyField(value) {
  // ...
}

// 2. Use no serviço
import { validateMyField } from '../utils/validators';

class MyService {
  create(dados) {
    validateMyField(dados.field);
  }
}

// 3. Teste em src/services/x.test.js
```

### 3. Adicionar Middleware

```javascript
// 1. Crie arquivo em src/middlewares/myMiddleware.js
function myMiddleware(req, res, next) {
  // seu código
  next();
}

// 2. Importe e use em src/routes/x.js
const myMiddleware = require('../middlewares/myMiddleware');
router.get('/endpoint', myMiddleware, controller);
```

## 🐛 Debugging

### VS Code

Adicione arquivo `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Launch Program",
      "program": "${workspaceFolder}/src/server.js",
      "restart": true,
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "env": {
        "NODE_ENV": "development"
      }
    }
  ]
}
```

Então pressione F5 para iniciar com debugger.

### Usando Console.log

```javascript
// Logs aparecem no terminal onde npm run dev está rodando
console.log('Valor:', variavel);
console.error('Erro:', erro);
```

## 📱 Testando a API

### Com curl

```bash
# Register
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "senha": "password", "nome": "Test"}'

# Login
TOKEN=$(curl -s -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "senha": "password"}' | jq -r '.data.token')

# Get data com token
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/medicamentos
```

### Com Postman

1. Importe `POSTMAN_COLLECTION.json`
2. Configure a variável `token` após login
3. Use em outros endpoints

### Com Insomnia

1. Importe `POSTMAN_COLLECTION.json`
2. Use as mesmas requisições Postman

## 🔍 Verificar Arquivos Modificados

```bash
# Ver quais arquivos foram modificados
git status

# Ver diferenças
git diff

# Adicionar tudo para commit
git add .

# Criar commit
git commit -m "Descrição das mudanças"
```

## 🌐 Variáveis de Ambiente Avançadas

Para testes locais, você pode adicionar ao `.env`:

```env
# Desenvolvimento
PORT=3000
NODE_ENV=development
DEBUG=true

# JWT
JWT_SECRET=chave-para-desenvolvimento-apenas
JWT_EXPIRATION=7d

# Logging
LOG_LEVEL=debug
```

## 📚 Links Úteis

- [Documentação Node.js](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/)
- [JWT Introduction](https://jwt.io/introduction)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest](https://github.com/visionmedia/supertest)

## ⚡ Dicas de Produtividade

### 1. Auto-format com Prettier
```bash
npm install --save-dev prettier
npx prettier --write src/
```

### 2. Lint com ESLint
```bash
npm install --save-dev eslint
npx eslint src/
```

### 3. Pre-commit Hooks com husky
```bash
npm install husky
npx husky install
```

### 4. Variáveis de Ambiente Dinâmicas em Testes

```bash
# Teste com NODE_ENV específico
NODE_ENV=test npm test
```

## 🎯 Checklist Antes de Commitar

- [ ] Código testado localmente
- [ ] Testes passando (`npm test`)
- [ ] Sem console.log de debug
- [ ] Sem comentários desnecessários
- [ ] Sem código comentado
- [ ] Mensagem de commit clara
- [ ] Sem quebra de funcionalidade existente

## 📞 Ajuda

Se tiver problemas:

1. Verifique se Node.js está instalado: `node --version`
2. Verifique se npm está atualizado: `npm update -g npm`
3. Delete `node_modules` e reinstale: `rm -rf node_modules && npm install`
4. Limpe npm cache: `npm cache clean --force`
5. Verifique porta 3000 disponível: `lsof -i :3000` (Mac/Linux) ou `netstat -ano | findstr :3000` (Windows)

---

**Bom desenvolvimento!** 🚀
