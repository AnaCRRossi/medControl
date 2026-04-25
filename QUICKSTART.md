# 🚀 Quick Start - MedControl API

## ⚡ 5 Minutos de Setup

### 1️⃣ Instalação
```bash
npm install
```

### 2️⃣ Configure .env
```bash
cp .env.example .env
# Edite .env se necessário (padrões já funcionam)
```

### 3️⃣ Inicie o Servidor
```bash
npm run dev
```

### 4️⃣ Teste
```bash
# Em outro terminal
curl http://localhost:3000/health
```

✅ **Pronto!** API rodando em `http://localhost:3000`

---

## 🔐 Credenciais Padrão (Desenvolvimento)

**Admin:**
- Email: `admin@medcontrol.com`
- Senha: `admin123`

---

## 📡 Primeiras Requisições

### 1. Login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@medcontrol.com","senha":"admin123"}'
```

Copie o `token` da resposta.

### 2. Listar Medicamentos
```bash
curl -H "Authorization: Bearer SEU_TOKEN" \
  http://localhost:3000/api/medicamentos
```

### 3. Criar Prescrição
```bash
curl -X POST http://localhost:3000/api/prescricoes \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "medicamentoId": "UUID_DO_MEDICAMENTO",
    "dosagem": 500,
    "frequencia": "8h",
    "dataInicio": "2026-04-25T00:00:00Z",
    "dataFim": "2026-05-25T00:00:00Z"
  }'
```

---

## 🧪 Executar Testes

```bash
# Todos os testes
npm test

# Apenas unitários
npm run test:unit

# Apenas integração
npm run test:integration

# Watch mode (reexecuta ao salvar)
npm run test:watch
```

---

## 📚 Documentação

| Arquivo | Conteúdo |
|---------|----------|
| [README.md](./README.md) | Visão geral e instruções |
| [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md) | Arquitetura e design |
| [DEVELOPMENT.md](./DEVELOPMENT.md) | Guia de desenvolvimento |
| [CONTRIBUTING.md](./CONTRIBUTING.md) | Como contribuir |
| [CHANGELOG.md](./CHANGELOG.md) | Histórico de mudanças |

---

## 🐳 Docker

### Usando Docker Compose (Recomendado)
```bash
docker-compose up -d
# API em http://localhost:3000
```

### Ou Build Manual
```bash
docker build -t medcontrol .
docker run -p 3000:3000 medcontrol
```

---

## 📁 Estrutura

```
medControl/
├── src/
│   ├── config/           # Configurações
│   ├── controllers/      # Orquestração de requisições
│   ├── middlewares/      # Auth, validação, etc
│   ├── routes/           # Definição de endpoints
│   ├── services/         # Lógica de negócio ⭐
│   ├── utils/            # Helpers e utilitários
│   ├── database/         # Persistência de dados
│   ├── app.js            # Configuração Express
│   └── server.js         # Inicialização
├── tests/
│   ├── unit/             # Testes de serviços
│   └── integration/      # Testes de API
└── [arquivos de config]
```

---

## 🔑 Endpoints Principais

### Usuários
- `POST /api/users/register` - Novo usuário
- `POST /api/users/login` - Autenticar
- `GET /api/users/profile` - Meu perfil

### Medicamentos
- `GET /api/medicamentos` - Listar
- `POST /api/medicamentos` - Criar (ADMIN)

### Prescrições
- `GET /api/prescricoes/usuario/:id` - Minhas prescrições
- `POST /api/prescricoes` - Criar

### Registros
- `POST /api/registros-uso` - Registrar uso
- `GET /api/registros-uso/usuario/:id` - Meus registros

---

## ⚙️ Scripts npm

```bash
# Desenvolvimento
npm run dev              # Com auto-reload (nodemon)
npm start                # Produção

# Testes
npm test                 # Com cobertura
npm run test:watch       # Modo watch
npm run test:unit        # Apenas unitários
npm run test:integration # Apenas integração

# Qualidade
npm run lint             # Verificar código
npm run lint:fix         # Corrigir automaticamente

# Docker
npm run docker:build               # Build imagem
npm run docker:compose:up          # Iniciar
npm run docker:compose:down        # Parar
npm run docker:compose:logs        # Ver logs
```

---

## 🆘 Troubleshooting

| Problema | Solução |
|----------|---------|
| Porta 3000 em uso | `lsof -i :3000` ou mudar `PORT` em `.env` |
| `npm install` falha | Delete `node_modules` e `npm cache clean --force` |
| Testes falham | Verifique Node.js v14+ com `node --version` |
| JWT inválido | Certifique-se que `JWT_SECRET` em `.env` é consistente |

---

## 📞 Próximos Passos

1. **Ler a documentação**: [TECHNICAL_DOCUMENTATION.md](./TECHNICAL_DOCUMENTATION.md)
2. **Entender a arquitetura**: Olhe `src/services/` primeiro
3. **Explorar testes**: `tests/unit/UserService.test.js`
4. **Contribuir**: [CONTRIBUTING.md](./CONTRIBUTING.md)

---

## ✨ Recursos Importantes

- 🔐 **Autenticação JWT** - Todos os endpoints protegidos
- 🎯 **Validações de Negócio** - Intervalo, dose máxima, interações
- ✅ **Testes Completos** - Jest + Supertest
- 🐳 **Docker Ready** - Dockerfile + docker-compose.yml
- 📚 **Bem Documentado** - Código limpo e comentado

---

**Bom desenvolvimento!** 🚀

Para mais detalhes, consulte [README.md](./README.md)
