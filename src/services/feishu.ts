import { request } from '../utils';
import config from '../config';

interface SendMessageFeishuApi {
  msg_type: 'post';
  content: {
    post: {
      zh_cn: {
        title: string;
        content: any[];
      };
    };
  };
}

class FeishuService {
  async sendMessage({ title, content }: { title: string; content: any[] }) {
    const sendArr = config.webhooks.feiShu.map(url => {
      return this.sendMessageApi(url, {
        msg_type: 'post',
        content: {
          post: {
            zh_cn: {
              title,
              content,
            },
          },
        },
      });
    });

    return Promise.all(sendArr);
  }
  async sendMessageApi(url: string, data: SendMessageFeishuApi) {
    return request.post(url, data);
  }
}

export const feishuService = new FeishuService();
