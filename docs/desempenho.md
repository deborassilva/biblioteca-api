# Desempenho

> **PREENCHER com a medição real.** Rode o k6 e copie os números da saída. Não invente valores.

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
| Requisições totais | _(copiar do k6)_ |
| p95 de `http_req_duration` | _(copiar do k6)_ ms |
| Taxa de falhas | _(copiar do k6)_ |

Data e máquina da medição: _(preencher)_

## SLO

99% das requisições em menos de 300 ms. O histograma `http_request_duration_seconds`
em `/metrics` tem um bucket em 0.3 s para acompanhar esse limite.
