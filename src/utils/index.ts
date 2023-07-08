import _ from 'lodash';

export * from './logger';
export * from './webhook';
export * from './response';

function mergeOption(objValue: any, srcValue: any) {
  if (_.isArray(objValue)) {
    return _.uniq(objValue.concat(srcValue));
  }
}

export function merge(a: any, b: any) {
  return _.mergeWith(a, b, mergeOption);
}

type GitMsgData = {
  type: string;
  platform: string;
  repo: { url: string; name: string };
  user: string;
  commits: { url: string; no: string; note: string }[];
};

function getTelegramMessage({ type, platform, repo, user, commits }: GitMsgData) {
  return `*${type}*
平台: ${platform}
仓库: [${repo.name}](${repo.url})
用户: ${user}
提交信息:
${commits
  .map(commit => {
    return `[${commit.no}](${commit.url}) ${commit.note}`;
  })
  .join('\n')}`.replaceAll('-', '\\-');
}

export function getGitText({ data, target = 'telegram' }: { data: GitMsgData; target?: 'telegram' }) {
  switch (target) {
    case 'telegram':
      return getTelegramMessage(data);
    default:
      return '';
  }
}
