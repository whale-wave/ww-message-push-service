// @ts-ignore
import { Logger } from 'avan-logger';
import log4js from 'log4js';
import path from 'path';

type LoggerInterface = {
  daily: log4js.Logger;
  error: log4js.Logger;
  debug: log4js.Logger;
};

export const logger: LoggerInterface = new Logger(path.join(process.cwd(), 'logs'));
