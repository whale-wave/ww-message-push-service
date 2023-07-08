import { telegramService } from '../services';
import { Request, Response } from 'express';
import { SuccessResponse, ErrorResponse, logger, toFeiShu, getFeiShuPostByTemplate, getGitText } from '../utils';
import axios from 'axios';
import config from '../config';

class WebhookController {
  async gitlab(req: Request, res: Response) {
    const { object_kind, ref, user_name, user_username, project, commits } = req.body;
    const kindToTitle = {
      push: '推送commit',
      tag_push: '推送标签',
    } as any;

    await telegramService.sendMessage(
      getGitText({
        data: {
          type: kindToTitle[object_kind] || object_kind,
          platform: 'gitlab',
          repo: {
            url: project.web_url,
            name: project.name,
            branch: ref.replace('refs/heads/', ''),
          },
          user: {
            name: user_name,
            username: user_username,
          },
          commits: commits.map((commit: any) => {
            return {
              url: commit.url,
              no: commit.id.slice(0, 6),
              note: commit.message,
            };
          }),
        },
      })
    );

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
    try {
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

        const tgRes = await telegramService.sendMessage(
          getGitText({
            data: {
              type: 'push',
              platform: 'github',
              repo: {
                url: repository.html_url,
                name: repository.name,
                branch: project.branch,
              },
              user: {
                name: head_commit.author.name,
                username: head_commit.author.username,
              },
              commits: commits.map((commit: any) => {
                return {
                  url: commit.url,
                  no: commit.id.slice(0, 6),
                  note: commit.message,
                };
              }),
            },
          })
        );
        logger.daily.info('github to telegram result', tgRes);
      } else {
        logger.daily.info('github no support type', req.body);
        return res.json(new ErrorResponse({ message: 'no support' }));
      }

      for (const url of config.webhooks.feiShu) {
        const { data } = await axios.post(url, result);
        logger.daily.info('github to fei shu result', data);
      }

      res.json(new SuccessResponse());
    } catch (e) {
      logger.error.error('github webhook error', e);
      res.json(new ErrorResponse({ message: 'catch error' }));
    }
  }
}

export const webhookController = new WebhookController();
