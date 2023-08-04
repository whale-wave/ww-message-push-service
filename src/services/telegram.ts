import { GitMessageTemplate } from '../controllers';
import axios, { AxiosInstance } from 'axios';
import config from '../config';
import { replaceStr, replaceStrNoKongGe } from '../utils';
import dayjs from 'dayjs';

type SendMessageApi = { chat_id: string; text: string; parse_mode?: 'MarkdownV2' | 'HTML'; reply_to_message_id?: number; };
type SendMessageApiResponse = {
  ok: boolean;
  result: {
    message_id: number;
    from: { id: number; is_bot: boolean; first_name: string; username: string };
    chat: { id: number; title: string; is_forum: boolean; type: string };
    date: number;
    text: string;
  };
};

export type Activity = {
  name: string;
  address: string;
  start: number;
  end: number;
  signStart: number;
  signEnd: number;
  url: string;
  realSignUrl: string;
};

class TelegramService {
  request: AxiosInstance;

  constructor() {
    this.request = axios.create();
    this.request.interceptors.response.use(res => res.data);
  }

  private getBaseUrl({ token, proxy }: { token: string; proxy: string }) {
    return `${proxy || 'https://api.telegram.org'}/bot${token}`;
  }

  async sendMessageApi(token: string, data: SendMessageApi) {
    return this.request.post(
      `${this.getBaseUrl({
        token,
        proxy: config.telegram.proxy,
      })}/sendMessage`,
      data
    ) as Promise<SendMessageApiResponse>;
  }

  async sendMessage(text: string) {
    const reqArr = config.telegram.list.reduce(
      (arr, { token, chatGroups }) => [
        ...arr,
        ...chatGroups.map(({chatId, replyToMessageId}) => {
          const data = {
            chat_id: chatId,
            text,
            parse_mode: 'MarkdownV2',
          } as SendMessageApi;
          replyToMessageId && (data.reply_to_message_id = replyToMessageId)
          return this.sendMessageApi(token, data);
        }),
      ],
      [] as Promise<SendMessageApiResponse>[]
    );
    return Promise.all(reqArr);
  }

  // git 通知
  getGitTextByGitMessageTemplate(gitMessageTemplate: GitMessageTemplate) {
    return `*${replaceStr(gitMessageTemplate.type)}*
*平台*: ${replaceStr(gitMessageTemplate.platform)}
*仓库*: [${replaceStr(gitMessageTemplate.repo.name)}](${replaceStr(gitMessageTemplate.repo.url)})
*分支*: ${replaceStr(gitMessageTemplate.branch)}
*操作人*: ${replaceStr(`${gitMessageTemplate.user.name}(${gitMessageTemplate.user.username})`)}
*提交信息*:
${gitMessageTemplate.commits
  .map(commit => {
    return `[${replaceStr(commit.no)}](${replaceStr(commit.url)}) ${replaceStr(commit.note)}`;
  })
  .join('')}`;
  }

  // 活动推荐
  getActivityTextByActivity(activity: Activity) {
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
  getActivitiesTextByActivities(activities: Activity[]) {
    let message = '*活动推荐*\n\n';
    message += activities.map(activity => this.getActivityTextByActivity(activity)).join('\n\n');
    return message;
  }
}

export const telegramService = new TelegramService();
