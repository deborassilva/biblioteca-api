export const config = {
  port: Number(process.env.PORT) || 3000,
  logLevel: process.env.LOG_LEVEL || 'info',
  limiteEmprestimos: Number(process.env.LIMITE_EMPRESTIMOS) || 3,
  prazoDias: Number(process.env.PRAZO_DIAS) || 14,
};
