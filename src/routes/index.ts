import express, { Application } from 'express';
import { webhookRouter } from './webhook';

const apiRouter = express.Router();
apiRouter.use('/webhook', webhookRouter);

export const initRoute = (app: Application) => {
  app.use('/api', apiRouter);
};
