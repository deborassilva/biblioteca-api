import { criarApp } from './app.js';
import { config } from './config.js';
import { EmprestimoService } from './domain/emprestimoService.js';
import { logger } from './logger.js';
import { MemoriaRepositorio } from './repositories/memoriaRepositorio.js';

const service = new EmprestimoService(new MemoriaRepositorio(), {
  limite: config.limiteEmprestimos,
  prazoDias: config.prazoDias,
});

criarApp({ service, logger }).listen(config.port, () => {
  logger.info({ porta: config.port }, 'API da biblioteca no ar');
});
