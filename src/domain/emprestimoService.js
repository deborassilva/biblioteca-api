import { randomUUID } from 'node:crypto';
import { NaoEncontradoError, RegraDeNegocioError, ValidacaoError } from './errors.js';

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/**
 * Regras do fluxo principal: emprestar e devolver um livro.
 * Depende de uma abstração de repositório (inversão de dependência),
 * então não sabe se os dados estão em memória ou em um banco.
 */
export class EmprestimoService {
  constructor(repositorio, { limite = 3, prazoDias = 14, agora = () => new Date() } = {}) {
    this.repositorio = repositorio;
    this.limite = limite;
    this.prazoDias = prazoDias;
    this.agora = agora;
  }

  async listarLivros() {
    return this.repositorio.listarLivros();
  }

  async emprestar({ usuarioId, livroId } = {}) {
    if (typeof usuarioId !== 'string' || usuarioId.trim() === '') {
      throw new ValidacaoError('usuarioId é obrigatório');
    }
    if (typeof livroId !== 'string' || livroId.trim() === '') {
      throw new ValidacaoError('livroId é obrigatório');
    }

    const livro = await this.repositorio.buscarLivro(livroId);
    if (!livro) {
      throw new NaoEncontradoError(`Livro ${livroId} não encontrado`);
    }
    if (!livro.disponivel) {
      throw new RegraDeNegocioError('LIVRO_INDISPONIVEL', 'Livro já está emprestado');
    }

    const ativos = await this.repositorio.contarAtivosDoUsuario(usuarioId);
    if (ativos >= this.limite) {
      throw new RegraDeNegocioError(
        'LIMITE_ATINGIDO',
        `Usuário já possui ${this.limite} empréstimos ativos`,
      );
    }

    const inicio = this.agora();
    const emprestimo = {
      id: randomUUID(),
      usuarioId,
      livroId,
      emprestadoEm: inicio.toISOString(),
      devolverAte: new Date(inicio.getTime() + this.prazoDias * MS_POR_DIA).toISOString(),
      devolvidoEm: null,
    };

    await this.repositorio.salvarEmprestimo(emprestimo);
    await this.repositorio.salvarLivro({ ...livro, disponivel: false });
    return emprestimo;
  }

  async devolver(emprestimoId) {
    const emprestimo = await this.repositorio.buscarEmprestimo(emprestimoId);
    if (!emprestimo) {
      throw new NaoEncontradoError(`Empréstimo ${emprestimoId} não encontrado`);
    }
    if (emprestimo.devolvidoEm) {
      throw new RegraDeNegocioError('JA_DEVOLVIDO', 'Empréstimo já foi devolvido');
    }

    const agora = this.agora();
    const atualizado = { ...emprestimo, devolvidoEm: agora.toISOString() };
    await this.repositorio.salvarEmprestimo(atualizado);

    const livro = await this.repositorio.buscarLivro(emprestimo.livroId);
    await this.repositorio.salvarLivro({ ...livro, disponivel: true });

    return { ...atualizado, atrasado: agora > new Date(emprestimo.devolverAte) };
  }
}
