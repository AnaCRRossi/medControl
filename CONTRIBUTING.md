# Guia de Contribuição

Obrigado por se interessar em contribuir para o MedControl! Este documento fornece diretrizes para contribuir ao projeto.

## Código de Conduta

Todos os colaboradores devem aderir a um padrão profissional e respeitoso.

## Começar

### 1. Fork o Repositório
```bash
# Crie um fork no GitHub
```

### 2. Clone seu Fork
```bash
git clone https://github.com/seu-usuario/medControl.git
cd medControl
```

### 3. Configure o Repositório Remoto
```bash
git remote add upstream https://github.com/original-owner/medControl.git
git fetch upstream
```

### 4. Crie uma Branch
```bash
# Sempre a partir da branch main
git checkout main
git pull upstream main

# Crie sua branch de feature
git checkout -b feature/sua-feature
```

## Desenvolvendo

### 1. Instale Dependências
```bash
npm install
```

### 2. Faça suas Mudanças

Siga a estrutura do projeto:
- Novas funcionalidades → `src/services/`
- Novos endpoints → `src/routes/` + `src/controllers/`
- Novos middlewares → `src/middlewares/`
- Utilitários → `src/utils/`

### 3. Código Limpo

```bash
# Lint seu código
npm run lint

# Corrija automaticamente
npm run lint:fix
```

### 4. Escreva Testes

```bash
# Testes de unidade
npm run test:unit

# Testes de integração
npm run test:integration

# Todos com cobertura
npm test
```

Sempre mantenha cobertura >= 80%.

### 5. Teste Localmente

```bash
npm run dev
# Abra http://localhost:3000/health
```

## Padrões de Código

### Nomenclatura
```javascript
// Variáveis e funções: camelCase
const usuarioId = '123';
function criarUsuario() { }

// Classes: PascalCase
class UserService { }
const service = new UserService();

// Constantes: UPPER_SNAKE_CASE
const MAX_RETRIES = 3;
const DEFAULT_TIMEOUT = 5000;
```

### Estrutura de Função
```javascript
// ✅ Bom
function validarEmail(email) {
  if (!email) {
    throw new ValidationError('Email é obrigatório');
  }
  
  if (!email.includes('@')) {
    throw new ValidationError('Email inválido');
  }
  
  return true;
}

// ❌ Ruim
function validarEmail(email) {
  if (email && email.includes('@')) return true;
}
```

### Comentários
```javascript
// ✅ Útil - explica o "por quê"
// Soft delete para manter histórico
usuario.deleted = true;

// ❌ Óbvio - desnecessário
// Setar deleted para true
usuario.deleted = true;
```

### Tratamento de Erros
```javascript
// ✅ Bom
try {
  const usuario = UserService.findById(id);
} catch (error) {
  if (error instanceof NotFoundError) {
    return sendError(res, error, 404);
  }
  return sendError(res, error, 500);
}

// ❌ Ruim
try {
  const usuario = UserService.findById(id);
} catch (error) {
  console.log(error);
}
```

## Protocolo de Commit

### Mensagens Clara e Descritivas

```bash
# ✅ Bom
git commit -m "feat: adiciona validação de intervalo entre doses"
git commit -m "fix: corrige cálculo de dose máxima diária"
git commit -m "docs: atualiza README com novos endpoints"
git commit -m "test: adiciona testes para RegistroUsoService"

# ❌ Ruim
git commit -m "mudança"
git commit -m "fix bug"
git commit -m "alterações aleatórias"
```

### Formato de Commit
Comece com um tipo:
- **feat**: Nova funcionalidade
- **fix**: Correção de bug
- **docs**: Mudanças de documentação
- **style**: Formatação, sem mudança lógica
- **refactor**: Refatoração de código
- **perf**: Melhorias de performance
- **test**: Adição ou mudança de testes
- **chore**: Atualizações de dependências

## Pull Request

### 1. Push sua Branch
```bash
git push origin feature/sua-feature
```

### 2. Abra um PR no GitHub

Forneça:
- Título descritivo
- Descrição do que mudou
- Referência a issues relacionadas (#123)
- Screenshots se relevante
- Checklist:
  - [ ] Testes passando
  - [ ] Lint passando
  - [ ] Cobertura >= 80%
  - [ ] Documentação atualizada
  - [ ] Sem conflitos com main

### 3. Responda à Review
Esteja aberto a feedback e pronto para fazer ajustes.

## Checklist Antes de Submeter

- [ ] `npm test` passa ✅
- [ ] `npm run lint` sem erros ✅
- [ ] Cobertura >= 80% ✅
- [ ] Commit message clara e descritiva ✅
- [ ] Nenhum `console.log` de debug ✅
- [ ] Código comentado removido ✅
- [ ] Nenhuma quebra de funcionalidade ✅
- [ ] README/docs atualizado ✅
- [ ] CHANGELOG.md atualizado ✅

## Adicionando Novas Features

### Exemplo: Adicionar Novo Endpoint

```javascript
// 1. Serviço (src/services/UserService.js)
class UserService {
  // ... métodos existentes
  
  // Novo método com validações
  verifyEmail(userId) {
    const user = this.findById(userId);
    user.emailVerified = true;
    return user;
  }
}

// 2. Controlador (src/controllers/UserController.js)
class UserController {
  async verifyEmail(req, res) {
    try {
      const { id } = req.params;
      const usuario = UserService.verifyEmail(id);
      sendSuccess(res, usuario);
    } catch (error) {
      sendError(res, error);
    }
  }
}

// 3. Rota (src/routes/users.js)
router.put(
  '/:id/verify',
  authenticateToken,
  authorize('ADMIN'),
  (req, res) => UserController.verifyEmail(req, res)
);

// 4. Teste (tests/integration/users.test.js)
describe('PUT /api/users/:id/verify', () => {
  it('should verify user email', async () => {
    const response = await request(app)
      .put(`/api/users/${userId}/verify`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body.data.emailVerified).toBe(true);
  });
});
```

## Reportar Bugs

Se encontrar um bug:

1. **Verifique se já foi reportado**: Procure em Issues
2. **Crie um Issue** com:
   - Descrição clara
   - Passos para reproduzir
   - Comportamento esperado vs atual
   - Informações do ambiente (Node.js version, SO, etc)
   - Logs de erro

Exemplo:
```markdown
## Bug Report: Intervalo entre doses não validado corretamente

### Descrição
Ao registrar um uso dentro do intervalo mínimo permitido, 
a validação não está funcionando.

### Passos para Reproduzir
1. Criar prescrição de Paracetamol (intervalo 4h)
2. Registrar uso em 08:00
3. Tentar registrar uso em 10:00

### Esperado
Erro validação (intervalo mínimo 4h)

### Obtido
Registrou com sucesso

### Ambiente
- Node.js v18.16.0
- npm 9.6.4
- linux
```

## Sugestões e Melhorias

Para sugestões de funcionalidades:

1. Verifique se já existe em Issues/Discussions
2. Abra uma Discussion ou Issue com tag `enhancement`
3. Forneça contexto e casos de uso

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a licença MIT do projeto.

## Contato

- Issues: Use GitHub Issues
- Discussões: Use GitHub Discussions
- Email: [se seu projeto tiver]

---

**Obrigado por contribuir ao MedControl!** 🙏

