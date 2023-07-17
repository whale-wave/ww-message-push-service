import { request } from '../utils';
import config from '../config';
import { GitMessageTemplate } from '../controllers';

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

  getGitContentByGitMessageTemplate(gitMessageTemplate: GitMessageTemplate) {
    return [
      [{ tag: 'at', user_id: 'all' }],
      [
        { tag: 'text', text: '平台: ' },
        { tag: 'text', text: gitMessageTemplate.platform },
      ],
      [
        { tag: 'text', text: '仓库: ' },
        { tag: 'a', text: gitMessageTemplate.repo.name, href: gitMessageTemplate.repo.url },
      ],
      [
        { tag: 'text', text: '分支: ' },
        { tag: 'text', text: gitMessageTemplate.branch },
      ],
      [
        { tag: 'text', text: '操作人: ' },
        { tag: 'text', text: `${gitMessageTemplate.user.name}(${gitMessageTemplate.user.username})` },
      ],
      [{ tag: 'text', text: '提交信息:' }],
      ...gitMessageTemplate.commits.map(commit => {
        return [
          { tag: 'a', text: commit.no, href: commit.url },
          { tag: 'text', text: commit.note },
        ];
      }),
    ];
  }
}

export const feishuService = new FeishuService();
