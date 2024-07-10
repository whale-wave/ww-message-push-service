class GitlabService {
  public kindToTitleMap = {
    push: '推送commit',
    tag_push: '推送标签',
  } as Record<string, string>;

  public isPushBranch(before: string, after: string): boolean {
    return Number(before) === 0 && Number(after) !== 0;
  }

  public isDeleteBranch(before: string, after: string): boolean {
    return Number(before) !== 0 && Number(after) === 0;
  }

  public getType(data: any): string {
    const { object_kind, before, after } = data;

    if (this.isPushBranch(before, after)) {
      return '创建分支';
    }
    if (this.isDeleteBranch(before, after)) {
      return '删除分支';
    }

    return this.kindToTitleMap[object_kind] || object_kind;
  }
}

export const gitlabService = new GitlabService();
