import pino from 'pino';
import request from 'supertest';
import { beforeEach, describe, expect, it } from 'vitest';
import { criarApp } from '../../src/app.js';
import { EmprestimoService } from '../../src/domain/emprestimoService.js';
import { MemoriaRepositorio } from '../../src/repositories/memoriaRepositorio.js';

describe('Fluxo principal: emprestar e devolver (HTTP)', () => {
  let app;

  beforeEach(() => {
    const service = new EmprestimoService(new MemoriaRepositorio(), { limite: 3, prazoDias: 14 });
    app = criarApp({ service, logger: pino({ level: 'silent' }) });
  });

  it('empresta, bloqueia segundo empréstimo do mesmo livro, devolve e empresta de novo', async () => {
    const criado = await request(app).post('/emprestimos').send({ usuarioId: 'ana', livroId: '1' });
    expect(criado.status).toBe(201);
    expect(criado.body.livroId).toBe('1');

    const conflito = await request(app).post('/emprestimos').send({ usuarioId: 'bia', livroId: '1' });
    expect(conflito.status).toBe(409);
    expect(conflito.body.erro).toBe('LIVRO_INDISPONIVEL');

    const devolucao = await request(app).post(`/emprestimos/${criado.body.id}/devolucao`);
    expect(devolucao.status).toBe(200);
    expect(devolucao.body.devolvidoEm).not.toBeNull();

    const outra = await request(app).post('/emprestimos').send({ usuarioId: 'bia', livroId: '1' });
    expect(outra.status).toBe(201);
  });

  it('retorna 400 para dados inválidos', async () => {
    const res = await request(app).post('/emprestimos').send({ livroId: '1' });
    expect(res.status).toBe(400);
  });

  it('retorna 400 para JSON malformado', async () => {
    const res = await request(app)
      .post('/emprestimos')
      .set('Content-Type', 'application/json')
      .send('{quebrado');
    expect(res.status).toBe(400);
    expect(res.body.erro).toBe('JSON_INVALIDO');
  });

  it('retorna 404 para livro inexistente', async () => {
    const res = await request(app).post('/emprestimos').send({ usuarioId: 'ana', livroId: 'xx' });
    expect(res.status).toBe(404);
  });

  it('lista livros e responde ao healthcheck', async () => {
    const livros = await request(app).get('/livros');
    expect(livros.status).toBe(200);
    expect(livros.body).toHaveLength(5);

    const saude = await request(app).get('/saude');
    expect(saude.body).toEqual({ status: 'ok' });
  });

  it('expõe métricas no formato Prometheus', async () => {
    await request(app).get('/livros');
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('http_request_duration_seconds');
  });
});
