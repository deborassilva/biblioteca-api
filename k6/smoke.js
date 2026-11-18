import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE = __ENV.BASE_URL || 'http://localhost:3000';

export const options = {
  vus: 5,
  duration: '30s',
  thresholds: {
    // SLO: 99% das requisições abaixo de 300 ms; medimos o p95 como indicador.
    http_req_duration: ['p(95)<300'],
    http_req_failed: ['rate<0.01'],
  },
};

// 201 (emprestou) e 409 (livro já emprestado) são respostas esperadas do fluxo.
http.setResponseCallback(http.expectedStatuses(200, 201, 409));

export default function () {
  http.get(`${BASE}/livros`);

  const livroId = String(1 + Math.floor(Math.random() * 5));
  const usuarioId = `vu-${__VU}`;
  const res = http.post(
    `${BASE}/emprestimos`,
    JSON.stringify({ usuarioId, livroId }),
    { headers: { 'Content-Type': 'application/json' } },
  );
  check(res, { 'emprestimo 201 ou 409': (r) => r.status === 201 || r.status === 409 });

  if (res.status === 201) {
    http.post(`${BASE}/emprestimos/${res.json('id')}/devolucao`);
  }
  sleep(0.2);
}
