# Desempenho


## Como medir

```bash
docker compose up -d
k6 run k6/smoke.js
```

## Cenário

5 usuários virtuais por 30 s, fazendo `GET /livros`, `POST /emprestimos` e a devolução.

## Resultado medido

| Métrica | Valor |
|---|---|
| Requisições totais | 2059 |
| Taxa de requisições | 68,4 req/s |
| Taxa de falhas | 0,00% (0 de 2059) |
| Duração média | 1,65 ms |
| Mediana | 1,22 ms |
| p90 | 2,93 ms |
| **p95 de `http_req_duration`** | **4,11 ms** |
| Máximo | 11,86 ms |

Data e máquina da medição: 18/11/2026, GitHub Codespaces (2 núcleos), API rodando via `docker compose up`.

## SLO

99% das requisições em menos de 300 ms. O histograma `http_request_duration_seconds`
em `/metrics` tem um bucket em 0.3 s para acompanhar esse limite.
