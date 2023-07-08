import { Request, Response } from 'express';
import { SuccessResponse, ErrorResponse, logger, toFeiShu, getFeiShuPostByTemplate } from '../utils';
import axios from 'axios';
import config from '../config';

class WebhookController {
  async gitlab(req: Request, res: Response) {
    const { object_kind, ref, user_name, user_username, project, commits } = req.body;
    const kindToTitle = {
      push: '推送commit',
      tag_push: '推送标签',
    } as any;

    const result = toFeiShu(
      {
        title: kindToTitle[object_kind] || object_kind,
        user_name,
        user_username,
        project: {
          name: project.name,
          url: project.web_url,
          branch: ref.replace('refs/heads/', ''),
        },
        commits,
      },
      'gitlab'
    );
    for (const url of config.webhooks.feiShu) {
      const { data } = await axios.post(url, result);
      logger.daily.info('gitlab to fei shu result', data);
    }
    res.json(new SuccessResponse());
  }

  async github(req: Request, res: Response) {
    const { head_commit, commits, repository, hook_id } = req.body;

    let result: any = null;

    const project = {
      name: repository.name,
      url: repository.html_url,
      branch: repository.default_branch,
    };

    if (hook_id && repository) {
      result = getFeiShuPostByTemplate('update', 'gitlab', project, [
        [
          {
            tag: 'text',
            text: 'webhook update',
          },
        ],
      ]);
    } else if (head_commit && repository && commits) {
      result = toFeiShu(
        {
          title: 'push',
          project,
          user_name: head_commit.author.name,
          user_username: head_commit.author.username,
          commits,
        },
        'github'
      );
    } else {
      logger.daily.info('github no support type', req.body);
      return res.send('no support');
    }

    for (const url of config.webhooks.feiShu) {
      const { data } = await axios.post(url, result);
      logger.daily.info('github to fei shu result', data);
    }
    res.json(new ErrorResponse());
  }
}

export const webhookController = new WebhookController();
