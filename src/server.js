const app = require('./app');
const config = require('./config/config');

const PORT = config.port;

const server = app.listen(PORT, () => {
  console.log(`Server rodando na porta ${PORT}`);
  console.log(`Ambiente: ${config.env}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Promise rejection não capturada:', err);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  console.error('Erro não capturado:', err);
  server.close(() => {
    process.exit(1);
  });
});

module.exports = server;
