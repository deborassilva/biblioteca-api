# ADR 0001: Usar o padrão Repository com armazenamento em memória

* Status: aceito
* Data: 2026-11-18

## Contexto e problema

O fluxo de empréstimo precisa guardar livros e empréstimos. Queremos testar as regras de negócio
(livro disponível, limite por usuário, devolução) sem depender de banco de dados, e manter a
possibilidade de trocar o armazenamento no futuro.

## Opções consideradas

* Acessar um banco diretamente dentro do serviço de domínio
* Repository com implementação em memória (escolhida)
* Repository com PostgreSQL desde já

## Decisão

Adotar o padrão **Repository**: o `EmprestimoService` depende de uma interface de repositório
(`buscarLivro`, `salvarEmprestimo`, etc.) recebida no construtor. A implementação atual é
`MemoriaRepositorio`.

## Consequências

* Bom: testes unitários rápidos e sem infraestrutura; respeita o princípio da inversão de
  dependência (o "D" do SOLID) e responsabilidade única (regra de negócio separada do acesso a dados).
* Bom: o Compose sobe com um único serviço.
* Ruim: os dados se perdem ao reiniciar a API. Aceitável para o escopo do Projeto B; um
  `PostgresRepositorio` poderá ser adicionado sem alterar o domínio.
