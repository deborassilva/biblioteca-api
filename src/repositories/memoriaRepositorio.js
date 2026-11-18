const LIVROS_INICIAIS = [
  { id: '1', titulo: 'Dom Casmurro', autor: 'Machado de Assis' },
  { id: '2', titulo: 'Grande Sertão: Veredas', autor: 'Guimarães Rosa' },
  { id: '3', titulo: 'Capitães da Areia', autor: 'Jorge Amado' },
  { id: '4', titulo: 'Vidas Secas', autor: 'Graciliano Ramos' },
  { id: '5', titulo: 'A Hora da Estrela', autor: 'Clarice Lispector' },
];

/** Implementação em memória do Repository. Trocável por um banco sem mexer no domínio. */
export class MemoriaRepositorio {
  constructor() {
    this.livros = new Map(LIVROS_INICIAIS.map((l) => [l.id, { ...l, disponivel: true }]));
    this.emprestimos = new Map();
  }

  async listarLivros() {
    return [...this.livros.values()];
  }

  async buscarLivro(id) {
    return this.livros.get(id) ?? null;
  }

  async salvarLivro(livro) {
    this.livros.set(livro.id, livro);
  }

  async buscarEmprestimo(id) {
    return this.emprestimos.get(id) ?? null;
  }

  async salvarEmprestimo(emprestimo) {
    this.emprestimos.set(emprestimo.id, emprestimo);
  }

  async contarAtivosDoUsuario(usuarioId) {
    return [...this.emprestimos.values()].filter(
      (e) => e.usuarioId === usuarioId && !e.devolvidoEm,
    ).length;
  }
}
