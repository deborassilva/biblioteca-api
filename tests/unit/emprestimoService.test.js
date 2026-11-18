import { beforeEach, describe, expect, it } from 'vitest';
import { EmprestimoService } from '../../src/domain/emprestimoService.js';
import { MemoriaRepositorio } from '../../src/repositories/memoriaRepositorio.js';
import { NaoEncontradoError, RegraDeNegocioError, ValidacaoError } from '../../src/domain/errors.js';

describe('EmprestimoService', () => {
  let repo;
  let service;
  let agora;

  beforeEach(() => {
    repo = new MemoriaRepositorio();
    agora = new Date('2026-01-01T10:00:00.000Z');
    service = new EmprestimoService(repo, { limite: 2, prazoDias: 14, agora: () => agora });
  });

  it('empresta um livro disponível e marca como indisponível', async () => {
    const e = await service.emprestar({ usuarioId: 'ana', livroId: '1' });

    expect(e.usuarioId).toBe('ana');
    expect(e.devolvidoEm).toBeNull();
    expect(e.devolverAte).toBe('2026-01-15T10:00:00.000Z');
    expect((await repo.buscarLivro('1')).disponivel).toBe(false);
  });

  it('recusa livro já emprestado', async () => {
    await service.emprestar({ usuarioId: 'ana', livroId: '1' });

    await expect(service.emprestar({ usuarioId: 'bia', livroId: '1' })).rejects.toMatchObject({
      codigo: 'LIVRO_INDISPONIVEL',
    });
  });

  it('recusa quando o usuário atinge o limite de empréstimos', async () => {
    await service.emprestar({ usuarioId: 'ana', livroId: '1' });
    await service.emprestar({ usuarioId: 'ana', livroId: '2' });

    await expect(service.emprestar({ usuarioId: 'ana', livroId: '3' })).rejects.toMatchObject({
      codigo: 'LIMITE_ATINGIDO',
    });
  });

  it('recusa livro inexistente', async () => {
    await expect(service.emprestar({ usuarioId: 'ana', livroId: '999' })).rejects.toBeInstanceOf(
      NaoEncontradoError,
    );
  });

  it('recusa dados inválidos', async () => {
    await expect(service.emprestar({ livroId: '1' })).rejects.toBeInstanceOf(ValidacaoError);
    await expect(service.emprestar({ usuarioId: 'ana' })).rejects.toBeInstanceOf(ValidacaoError);
    await expect(service.emprestar()).rejects.toBeInstanceOf(ValidacaoError);
  });

  it('devolve no prazo e libera o livro', async () => {
    const e = await service.emprestar({ usuarioId: 'ana', livroId: '1' });
    agora = new Date('2026-01-05T10:00:00.000Z');

    const devolvido = await service.devolver(e.id);

    expect(devolvido.devolvidoEm).toBe('2026-01-05T10:00:00.000Z');
    expect(devolvido.atrasado).toBe(false);
    expect((await repo.buscarLivro('1')).disponivel).toBe(true);
  });

  it('marca como atrasado quando devolve após o prazo', async () => {
    const e = await service.emprestar({ usuarioId: 'ana', livroId: '1' });
    agora = new Date('2026-02-01T10:00:00.000Z');

    const devolvido = await service.devolver(e.id);

    expect(devolvido.atrasado).toBe(true);
  });

  it('não permite devolver duas vezes', async () => {
    const e = await service.emprestar({ usuarioId: 'ana', livroId: '1' });
    await service.devolver(e.id);

    await expect(service.devolver(e.id)).rejects.toBeInstanceOf(RegraDeNegocioError);
  });

  it('devolver libera o limite do usuário', async () => {
    const a = await service.emprestar({ usuarioId: 'ana', livroId: '1' });
    await service.emprestar({ usuarioId: 'ana', livroId: '2' });
    await service.devolver(a.id);

    const novo = await service.emprestar({ usuarioId: 'ana', livroId: '3' });

    expect(novo.livroId).toBe('3');
  });

  it('recusa devolução de empréstimo inexistente', async () => {
    await expect(service.devolver('nao-existe')).rejects.toBeInstanceOf(NaoEncontradoError);
  });

  it('lista os livros cadastrados', async () => {
    const livros = await service.listarLivros();

    expect(livros).toHaveLength(5);
    expect(livros.every((l) => l.disponivel)).toBe(true);
  });
});
