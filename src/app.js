import express from 'express';
import pinoHttp from 'pino-http';
import { NaoEncontradoError, RegraDeNegocioError, ValidacaoError } from './domain/errors.js';
import { criarMetricas } from './metrics.js';

const assincrono = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function criarApp({ service, logger }) {
  const app = express();
  const { registro, middleware } = criarMetricas();

  app.use(express.json());
  app.use(pinoHttp({ logger }));
  app.use(middleware);

  app.get('/saude', (_req, res) => res.json({ status: 'ok' }));

  app.get('/metrics', assincrono(async (_req, res) => {
    res.set('Content-Type', registro.contentType);
    res.send(await registro.metrics());
  }));

  app.get('/livros', assincrono(async (_req, res) => {
    res.json(await service.listarLivros());
  }));

  app.post('/emprestimos', assincrono(async (req, res) => {
    const emprestimo = await service.emprestar(req.body);
    res.status(201).json(emprestimo);
  }));

  app.post('/emprestimos/:id/devolucao', assincrono(async (req, res) => {
    res.json(await service.devolver(req.params.id));
  }));

  app.use((err, req, res, _next) => {
    if (err instanceof ValidacaoError) {
      return res.status(400).json({ erro: err.codigo, mensagem: err.message });
    }
    if (err instanceof NaoEncontradoError) {
      return res.status(404).json({ erro: err.codigo, mensagem: err.message });
    }
    if (err instanceof RegraDeNegocioError) {
      return res.status(409).json({ erro: err.codigo, mensagem: err.message });
    }
    if (err.type === 'entity.parse.failed') {
      return res.status(400).json({ erro: 'JSON_INVALIDO', mensagem: 'Corpo não é um JSON válido' });
    }
    req.log.error({ err }, 'erro inesperado');
    return res.status(500).json({ erro: 'ERRO_INTERNO', mensagem: 'Erro interno' });
  });

  return app;
}
