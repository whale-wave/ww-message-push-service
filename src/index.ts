import express from 'express';
import bodyParser from 'body-parser';
import { initConfig, getConfig } from './config';
import { loggerMiddleware } from './middleware';
import { logger } from './utils';
import { initRoute } from 'routes';
import { webhookController } from 'controllers';

!(async () => {
  await initConfig();

  const app = express();

  app.use(bodyParser.json());
  app.use(loggerMiddleware);

  initRoute(app);

  app.get('/', (req, res) => {
    res.send('hello! I am Avan.');
  });

  app.post('/', webhookController.github);
  app.post('/webhook/github', webhookController.github);
  app.post('/webhook/gitlab', webhookController.gitlab);

  app.listen(getConfig().port, () => {
    logger.daily.info(`Service started successfully http://localhost:${getConfig().port}`);
  });
})();
