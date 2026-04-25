# MedControl API

Uma API REST completa para controle de medicamentos, prescrições e registros de uso. Desenvolvida com Node.js e Express, seguindo a arquitetura MVC com segurança robusta e validações de regras de negócio.

## 📋 Requisitos

- Node.js v14+
- npm v6+

## 🚀 Instalação

1. Clone o repositório:
```bash
git clone <repositorio-url>
cd medControl
```

2. Instale as dependências:
```bash
npm install
```

3. Crie um arquivo `.env` baseado em `.env.example`:
```bash
cp .env.example .env
```

4. Configure as variáveis de ambiente no `.env` se necessário.

## 📝 Variáveis de Ambiente

```env
PORT=3000
NODE_ENV=development
JWT_SECRET=sua-chave-secreta-muito-segura-mude-em-producao
JWT_EXPIRATION=24h
```

## 🎯 Executando a Aplicação

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

A API estará disponível em `http://localhost:3000`

### Health Check
```bash
curl http://localhost:3000/health
```

## 🧪 Testes

### Rodar todos os testes
```bash
npm test
```

### Rodar testes com cobertura
```bash
npm test -- --coverage
```

### Rodar testes de unidade
```bash
npm run test:unit
```

### Rodar testes de integração
```bash
npm run test:integration
```

### Modo watch
```bash
npm run test:watch
```

## 📚 Estrutura do Projeto

```
medControl/
├── src/
│   ├── config/          # Configurações gerais
│   ├── controllers/     # Controladores da API
│   ├── middlewares/     # Middlewares (auth, autorização, etc)
│   ├── models/          # Modelos de dados
│   ├── routes/          # Definição de rotas
│   ├── services/        # Lógica de negócio
│   ├── utils/           # Utilitários e helpers
│   ├── database/        # Gerenciamento de dados em memória
│   ├── app.js           # Configuração da aplicação
│   └── server.js        # Inicialização do servidor
├── tests/
│   ├── unit/            # Testes unitários
│   └── integration/     # Testes de integração
├── .env.example         # Exemplo de variáveis de ambiente
├── .gitignore           # Arquivos ignorados pelo git
├── jest.config.js       # Configuração do Jest
├── package.json         # Dependências e scripts
└── README.md            # Este arquivo
```

## 🔐 Segurança e Autenticação

### Autenticação com JWT

A API utiliza JWT (JSON Web Token) para autenticação. Para acessar endpoints protegidos:

1. Realize o login para obter um token:
```bash
POST /api/users/login
```

2. Use o token no header `Authorization`:
```bash
Authorization: Bearer seu-token-aqui
```

### Tipos de Usuário

- **ADMIN**: Acesso total a todas as funcionalidades
- **USER**: Acesso limitado aos seus próprios dados

## 📡 Endpoints da API

### Usuários
- `POST /api/users/register` - Registrar novo usuário
- `POST /api/users/login` - Fazer login
- `GET /api/users/profile` - Obter perfil do usuário autenticado
- `GET /api/users` - Listar todos os usuários (ADMIN)
- `PUT /api/users/:id` - Atualizar usuário (ADMIN)
- `DELETE /api/users/:id` - Deletar usuário (ADMIN)

### Medicamentos
- `GET /api/medicamentos` - Listar todos os medicamentos
- `GET /api/medicamentos/:id` - Obter medicamento por ID
- `POST /api/medicamentos` - Criar novo medicamento (ADMIN)
- `PUT /api/medicamentos/:id` - Atualizar medicamento (ADMIN)
- `DELETE /api/medicamentos/:id` - Deletar medicamento (ADMIN)

### Prescrições
- `GET /api/prescricoes` - Listar todas as prescrições (ADMIN)
- `GET /api/prescricoes/:id` - Obter prescrição por ID
- `GET /api/prescricoes/usuario/:usuarioId` - Listar prescrições do usuário
- `POST /api/prescricoes` - Criar nova prescrição
- `PUT /api/prescricoes/:id` - Atualizar prescrição
- `DELETE /api/prescricoes/:id` - Deletar prescrição

### Registros de Uso
- `GET /api/registros-uso` - Listar todos os registros (ADMIN)
- `GET /api/registros-uso/:id` - Obter registro por ID
- `GET /api/registros-uso/prescricao/:prescricaoId` - Listar registros de uma prescrição
- `GET /api/registros-uso/usuario/:usuarioId` - Listar registros do usuário
- `POST /api/registros-uso` - Criar novo registro
- `DELETE /api/registros-uso/:id` - Deletar registro

## 💼 Regras de Negócio Implementadas

### Prescrições
- ✅ Obrigatório: medicamento, dosagem, frequência e período
- ✅ Dose deve ser maior que zero
- ✅ Frequência deve ser compatível com intervalo mínimo do medicamento
- ✅ Detecta interações medicamentosas entre prescrições ativas
- ✅ Retorna alertas críticos sobre interações

### Registros de Uso
- ✅ Validação de intervalo mínimo entre doses
- ✅ Validação de dose máxima diária
- ✅ Alerta ao atingir 80% da dose máxima diária
- ✅ Validação de período da prescrição
- ✅ Previne duplicidade de registros no mesmo horário
- ✅ Suporta soft delete (exclusão lógica)

### Acesso e Autorização
- ✅ ADMIN pode gerenciar todos os dados
- ✅ USER pode apenas visualizar seus próprios dados
- ✅ USER não pode criar, editar ou deletar informações

## 📊 Exemplos de Uso

### Registrar novo usuário
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "senha": "senha123",
    "nome": "João Silva"
  }'
```

### Fazer login
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@exemplo.com",
    "senha": "senha123"
  }'
```

### Criar prescrição
```bash
curl -X POST http://localhost:3000/api/prescricoes \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-token-aqui" \
  -d '{
    "medicamentoId": "uuid-do-medicamento",
    "dosagem": 500,
    "frequencia": "8h",
    "dataInicio": "2026-04-25T00:00:00Z",
    "dataFim": "2026-05-25T00:00:00Z"
  }'
```

### Registrar uso de medicamento
```bash
curl -X POST http://localhost:3000/api/registros-uso \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-token-aqui" \
  -d '{
    "prescricaoId": "uuid-da-prescricao",
    "dosagem": 500,
    "dataHora": "2026-04-25T08:30:00Z"
  }'
```

## 🐛 Tratamento de Erros

A API retorna respostas estruturadas com status HTTP apropriados:

```json
{
  "success": false,
  "message": "Descrição do erro",
  "error": "NomeDoErro"
}
```

### Status HTTP Utilizados
- `200` - OK
- `201` - Created (sucesso na criação)
- `400` - Bad Request (validação falhou)
- `401` - Unauthorized (não autenticado)
- `403` - Forbidden (não autorizado)
- `404` - Not Found (recurso não encontrado)
- `409` - Conflict (conflito nos dados, ex: duplicação)
- `500` - Internal Server Error

## 📦 Dependências Principais

- **express**: Framework web
- **jsonwebtoken**: Autenticação JWT
- **uuid**: Geração de IDs únicos
- **dotenv**: Gerenciamento de variáveis de ambiente
- **jest**: Framework de testes
- **supertest**: Testes de API HTTP

## 🗄️ Persistência de Dados

Atualmente, os dados são armazenados em memória durante a execução. Para implementar persistência com banco de dados, integre:

- **PostgreSQL**: Com biblioteca `pg`
- **MongoDB**: Com biblioteca `mongoose`
- **SQLite**: Com biblioteca `sqlite3`

## 🚀 Deploy

### Heroku
```bash
heroku create seu-app
git push heroku main
```

### Docker
```bash
docker build -t medcontrol .
docker run -p 3000:3000 medcontrol
```

## 📄 Licença

MIT

## 👨‍💻 Contribuições

Contribuições são bem-vindas! Por favor:

1. Faça fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/minha-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona minha feature'`)
4. Push para a branch (`git push origin feature/minha-feature`)
5. Abra um Pull Request

## 📧 Suporte

Para suporte, abra uma issue no repositório.

---

**Versão**: 1.0.0  
**Data**: Abril 2026  
**Desenvolvido com ❤️**
