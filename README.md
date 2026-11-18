Nível: B

# API da Biblioteca

API de domínio único: **empréstimo e devolução de livros**. Fluxo principal: um usuário pega um livro
emprestado (se ele estiver disponível e o usuário não tiver passado do limite) e depois o devolve.

## Como subir (1 comando)

Requisito: Docker com Compose.

```bash
docker compose up --build
```

A API fica em http://localhost:3000. Teste:

```bash
curl http://localhost:3000/saude
curl http://localhost:3000/livros
curl -X POST http://localhost:3000/emprestimos \
  -H "Content-Type: application/json" \
  -d '{"usuarioId":"ana","livroId":"1"}'
```

Para devolver, use o `id` retornado: `POST /emprestimos/{id}/devolucao`.

## Rodar sem Docker

Requisito: Node 20+.

```bash
cp .env.example .env   # opcional, há valores padrão
npm ci
npm start
```

## Como testar

```bash
npm run lint   # ESLint
npm test       # testes unitários + integração + coverage
```

**Coverage mínimo declarado: 70%** (linhas, funções, ramos e statements). O `vitest.config.js`
faz o comando falhar se ficar abaixo disso.

## Regras de negócio

* Um livro só pode ser emprestado se estiver disponível.
* Cada usuário pode ter no máximo `LIMITE_EMPRESTIMOS` (padrão 3) empréstimos ativos.
* O prazo de devolução é `PRAZO_DIAS` (padrão 14) a partir do empréstimo.
* Um empréstimo não pode ser devolvido duas vezes.

## Variáveis de ambiente

Veja `.env.example`. Nenhum segredo é commitado; `.env` está no `.gitignore`.

## Observabilidade

* **Logs estruturados** em JSON com pino (`LOG_LEVEL` controla o nível).
* **Métrica:** `GET /metrics` (Prometheus), com o histograma `http_request_duration_seconds`.
* **SLO:** 99% das requisições em menos de 300 ms.

## Documentação

* OpenAPI: `docs/openapi.yaml`
* Decisão de arquitetura: `docs/adr/0001-repository-pattern.md`
* Medição de desempenho (k6): `docs/desempenho.md`
* Uso de IA: `docs/ia.md`

## Arquitetura

```
src/
├─ domain/        regras de negócio (EmprestimoService, erros)
├─ repositories/  acesso a dados (MemoriaRepositorio)
├─ app.js         rotas HTTP e tratamento de erros
└─ server.js      composição e inicialização
```

## CI

GitHub Actions (`.github/workflows/ci.yml`): `npm ci`, `npm run lint`, `npm test`.
Link da execução verde: https://github.com/deborassilva/biblioteca-api/actions/runs/44370457810
