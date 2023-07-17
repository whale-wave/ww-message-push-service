import { GitMessageTemplate } from '../controllers';
import axios, { AxiosInstance } from 'axios';
import config from '../config';
import { replaceStr } from '../utils';

type SendMessageApi = { chat_id: string; text: string; parse_mode?: 'MarkdownV2' | 'HTML' };
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
      (arr, { token, chatIds }) => [
        ...arr,
        ...chatIds.map(chat_id => {
          return this.sendMessageApi(token, {
            chat_id,
            text,
            parse_mode: 'MarkdownV2',
          });
        }),
      ],
      [] as Promise<SendMessageApiResponse>[]
    );
    return Promise.all(reqArr);
  }

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
}

export const telegramService = new TelegramService();
