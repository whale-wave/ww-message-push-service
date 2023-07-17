import { initRoute } from './routes';
import express from 'express';
import bodyParser from 'body-parser';
import { initConfig } from './config';
import { loggerMiddleware } from './middleware';
import { logger, request } from './utils';
import { webhookController } from './controllers';
import config from './config';
import schedule from 'node-schedule';
import { Activity, feishuService, telegramService } from './services';

!(async () => {
  await initConfig();

  const app = express();

  app.use(bodyParser.json());
  app.use(loggerMiddleware(logger));

  initRoute(app);

  app.get('/', (_, res) => {
    res.send('hello! I am Avan.');
  });

  app.post('/', webhookController.gitlab);
  app.post('/webhook/github', webhookController.github);
  app.post('/webhook/gitlab', webhookController.gitlab);

  app.listen(config.port, () => {
    logger.daily.info(`Service started successfully http://localhost:${config.port}`);
  });
})();

type GetNewestResponse = {
  rows: {
    id: number;
    url: string;
    banner_url: string;
    name: string;
    start: number;
    end: number;
    sign_start: number;
    sign_end: number;
    city_name: string;
    category: number;
    category_name: string;
    real_sign_url: string;
    real_activity_url: string;
    address: string;
  }[];
  size: number;
};

schedule.scheduleJob('0 0 8 * * *', async () => {
  // schedule.scheduleJob('*/5 * * * * *', async () => {
  if (!config.schedule.newset.enable) return;

  const newsetRes: GetNewestResponse = await request.get(
    `https://segmentfault.com/gateway/events?query=newest&city=440100`
  );
  const activities = [] as Activity[];
  newsetRes.rows.forEach(newset => {
    activities.push({
      name: `${newset.name}\\(${newset.city_name}\\)`,
      address: newset.address,
      start: newset.start,
      end: newset.end,
      signStart: newset.sign_start,
      signEnd: newset.sign_end,
      url: `https://segmentfault.com${newset.url}`,
      realSignUrl: newset.real_sign_url,
    });
  });

  try {
    const feishuSendMsgArr = await feishuService.sendMessage({
      title: '活动推荐',
      content: feishuService.getActivitiesContentByActivities(activities),
    });

    logger.daily.info('schedule job newset feishu send message res', feishuSendMsgArr);
  } catch (e) {
    logger.error.error('schedule job newset feishu send message error', e);
  }

  try {
    const message = telegramService.getActivitiesTextByActivities(activities);
    const sendRes = await telegramService.sendMessage(message);
    logger.daily.info('schedule job newset res', sendRes);
  } catch (e) {
    logger.error.error('schedule job newset error', e);
  }
});
