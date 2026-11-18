import client from 'prom-client';

export function criarMetricas() {
  const registro = new client.Registry();
  client.collectDefaultMetrics({ register: registro });

  const duracao = new client.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duração das requisições HTTP em segundos',
    labelNames: ['method', 'route', 'status'],
    // O bucket 0.3 corresponde ao limite do SLO (300 ms).
    buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2],
    registers: [registro],
  });

  const middleware = (req, res, next) => {
    const fim = duracao.startTimer();
    res.on('finish', () => {
      fim({
        method: req.method,
        route: req.route?.path ?? 'desconhecida',
        status: res.statusCode,
      });
    });
    next();
  };

  return { registro, middleware };
}
