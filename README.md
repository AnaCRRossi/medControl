# MedControl API

API REST para gerenciamento de medicamentos, prescrições e registros de uso.

O projeto foi organizado para ser simples, direto e adequado para portfólio, usando Node.js, Express e dados em memória.

## Instalação

```bash
npm install
```

## Como rodar

```bash
npm run dev
```

## URLs

- API: http://localhost:3000
- Swagger: http://localhost:3000/api-docs

## Funcionalidades principais

- Cadastro e autenticação de usuários com JWT
- Controle de permissões para usuários `ADMIN` e `USER`
- Cadastro, listagem, atualização e remoção de medicamentos
- Criação e consulta de prescrições
- Registro de uso de medicamentos
- Validações de dose, intervalo mínimo e período de prescrição
- Documentação interativa com Swagger

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
```

## Testes

```bash
npm test
```
