import { request } from '../utils';
import config from '../config';
import { GitMessageTemplate } from '../controllers';
import { Activity } from './telegram';
import dayjs from 'dayjs';

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

  // git 通知
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

  // 活动推荐
  getActivityContentByActivity(activity: Activity) {
    return [
      [{ tag: 'text', text: `活动名称: ${activity.name}` }],
      [{ tag: 'text', text: `活动地点: ${activity.address}` }],
      [
        {
          tag: 'text',
          text: `活动时间: ${dayjs(activity.start * 1000).format('YYYY-MM-DD HH:mm')} - ${dayjs(
            activity.end * 1000
          ).format('YYYY-MM-DD HH:mm')}`,
        },
      ],
      [
        { tag: 'text', text: '活动链接: ' },
        { tag: 'a', text: '点击跳转', href: activity.url },
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
        { tag: 'text', text: '报名链接: ' },
        { tag: 'a', text: '点击跳转', href: activity.realSignUrl },
      ],
    ];
  }
  getActivitiesContentByActivities(activities: Activity[]) {
    return [
      [{ tag: 'at', user_id: 'all' }],
      ...activities.reduce((result, activity, index) => {
        if (index !== 0) return [...result, [], ...this.getActivityContentByActivity(activity)];
        return [...result, ...this.getActivityContentByActivity(activity)];
      }, [] as any[]),
    ];
  }
}

export const feishuService = new FeishuService();
