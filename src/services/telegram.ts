import axios, { AxiosInstance } from 'axios';
import config from '../config';

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
}

export const telegramService = new TelegramService();
