import { initRoute } from './routes';
import express from 'express';
import bodyParser from 'body-parser';
import { initConfig } from './config';
import { loggerMiddleware } from './middleware';
import { logger, replaceStr, replaceStrNoKongGe, request, toViewJsonStr } from './utils';
import { webhookController } from './controllers';
import config from './config';
import schedule from 'node-schedule';
import dayjs from 'dayjs';
import { feishuService, telegramService } from './services';

!(async () => {
  await initConfig();

  const app = express();

  app.use(bodyParser.json());
  app.use(loggerMiddleware(logger));

  initRoute(app);

  app.get('/', (req, res) => {
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

type Activity = {
  name: string;
  address: string;
  start: number;
  end: number;
  signStart: number;
  signEnd: number;
  url: string;
  realSignUrl: string;
};

schedule.scheduleJob('0 0 8 * * *', async () => {
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

  function getActivitiesTelegramText(activity: Activity) {
    return `活动名称: ${replaceStr(activity.name)}
活动地点: ${replaceStr(activity.address)}
活动时间: ${replaceStr(dayjs(activity.start * 1000).format('YYYY-MM-DD HH:mm'))} \\- ${replaceStr(
      dayjs(activity.end * 1000).format('YYYY-MM-DD HH:mm')
    )}
活动链接: [点击跳转](${replaceStr(activity.url)})
报名时间: ${replaceStr(dayjs(activity.signStart * 1000).format('YYYY-MM-DD HH:mm'))} \\- ${replaceStr(
      dayjs(activity.signEnd * 1000).format('YYYY-MM-DD HH:mm')
    )}
报名链接: [点击跳转](${replaceStr(activity.realSignUrl)})`;
  }

  function getActivitiesTelegramText1(activity: Activity) {
    return replaceStrNoKongGe(`活动名称: ${activity.name}
活动地点: ${activity.address}
活动时间: ${dayjs(activity.start * 1000).format('YYYY-MM-DD HH:mm')} - ${dayjs(activity.end * 1000).format(
      'YYYY-MM-DD HH:mm'
    )}
活动链接: [点击跳转](${activity.url})
报名时间: ${dayjs(activity.signStart * 1000).format('YYYY-MM-DD HH:mm')} - ${dayjs(activity.signEnd * 1000).format(
      'YYYY-MM-DD HH:mm'
    )}
报名链接: [点击跳转](${activity.realSignUrl})`);
  }

  function getActivitiesFeishuContent(activity: Activity) {
    return [
      [
        {
          tag: 'text',
          text: `活动名称: ${activity.name}`,
        },
      ],
      [
        {
          tag: 'text',
          text: `活动地点: ${activity.address}`,
        },
      ],
      [
        {
          tag: 'text',
          text: `活动时间: ${dayjs(activity.start * 1000).format('YYYY-MM-DD HH:mm')} - ${dayjs(
            activity.end * 1000
          ).format('YYYY-MM-DD HH:mm')}`,
        },
      ],
      [
        {
          tag: 'text',
          text: '活动链接: ',
        },
        {
          tag: 'a',
          text: '点击跳转',
          href: activity.url,
        },
      ],
      [
        {
          tag: 'text',
          text: `报名时间: ${dayjs(activity.signStart * 1000).format('YYYY-MM-DD HH:mm')} - ${dayjs(
            activity.signEnd * 1000
          ).format('YYYY-MM-DD HH:mm')}`,
        },
      ],
      [
        {
          tag: 'text',
          text: '报名链接: ',
        },
        {
          tag: 'a',
          text: '点击跳转',
          href: activity.realSignUrl,
        },
      ],
    ];
  }

  // TODO: 暂时不发飞书
  // try {
  //   const feishuSendMsgArr = await feishuService.sendMessage({
  //     title: '活动推荐',
  //     content: [
  //       [{ tag: 'at', user_id: 'all' }],
  //       ...activities.reduce((result, activity, index) => {
  //         if (index !== 0) return [...result, [], ...getActivitiesFeishuContent(activity)];
  //         return [...result, ...getActivitiesFeishuContent(activity)];
  //       }, [] as any[]),
  //     ],
  //   });

  //   logger.daily.info('schedule job newset feishu send message res', feishuSendMsgArr);
  // } catch (e) {
  //   logger.error.error('schedule job newset feishu send message error', e);
  // }

  try {
    let message = '*活动推荐*\n\n';
    message += activities.map(activity => getActivitiesTelegramText(activity)).join('\n\n');
    let message2 = '*活动推荐*\n\n';
    message2 += activities.map(activity => getActivitiesTelegramText1(activity)).join('\n\n');
    console.log('======');
    console.log(message);
    console.log(message2);
    console.log('======');
    const sendRes = await telegramService.sendMessage(message2);
    logger.daily.info('schedule job newset res', sendRes);
  } catch (e) {
    logger.error.error('schedule job newset error', e);
  }
});
