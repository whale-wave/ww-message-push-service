import _ from 'lodash';

export * from './logger';
export * from './webhook';
export * from './response';
export * from './request';

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
  repo: { url: string; name: string; branch: string };
  user: {
    name: string;
    username: string;
  };
  commits: { url: string; no: string; note: string }[];
};

function getTelegramMessage({ type, platform, repo, user, commits }: GitMsgData) {
  return `*${type}*
平台: ${platform}
仓库: [${repo.name}](${replaceStr(repo.url)})
分支: ${repo.branch}
操作人: ${user.name}\\(${user.username}\\)
提交信息:
${commits
  .map(commit => {
    return `[${commit.no}](${replaceStr(commit.url)}) ${replaceStr(commit.note)}`;
  })
  .join('')}`;
}

export function getGitText({ data, target = 'telegram' }: { data: GitMsgData; target?: 'telegram' }) {
  switch (target) {
    case 'telegram':
      return getTelegramMessage(data);
    default:
      return '';
  }
}

export function toViewJsonStr(obj: any) {
  return JSON.stringify(obj, null, 2);
}

export function replaceStr(str: string) {
  return str.replace(/[-=.())]/g, '\\$&');
}

export function replaceStrNoKongGe(str: string) {
  return str.replace(/[-=.]/g, '\\$&');
}
