import pino from 'pino';
import { config } from './config.js';

// Logs estruturados em JSON (uma linha por evento).
export const logger = pino({ level: config.logLevel });
