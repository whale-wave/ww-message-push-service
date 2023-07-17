import { GitMessageTemplate } from '../controllers';

export interface CodeupMessageRaw {
  after: string;
  aliyun_pk: string;
  before: string;
  checkout_sha: string;
  commits: {
    author: {
      email: string;
      name: string;
    };
    id: string;
    message: string;
    timestamp: string;
    url: string;
  }[];
  object_kind: 'push';
  project_id: number;
  ref: string;
  repository: {
    git_http_url: string;
    git_secondary_http_url: string;
    git_secondary_ssh_url: string;
    git_ssh_url: string;
    homepage: string;
    name: string;
    url: string;
    visibility_level: number;
  };
  total_commits_count: number;
  user_email: string;
  user_extern_uid: string;
  user_id: number;
  user_name: string;
}

class CodeupService {
  getGithubMessageTemplate(raw: CodeupMessageRaw): GitMessageTemplate {
    const githubMessageTemplate = {
      type: raw.object_kind,
      platform: 'codeup',
      repo: {
        url: raw.repository.homepage,
        name: raw.repository.name,
      },
      branch: raw.ref.replace('refs/heads/', ''),
      user: {
        name: raw.user_name,
        username: raw.user_extern_uid,
      },
      commits: raw.commits.map(commit => {
        return {
          url: commit.url,
          no: commit.id.slice(0, 6),
          note: commit.message,
        };
      }),
    } as GitMessageTemplate;
    return githubMessageTemplate;
  }
}

export const codeupService = new CodeupService();
