class GitlabService {
  public kindToTitleMap = {
    push: '推送commit',
    tag_push: '推送标签',
  } as Record<string, string>;

  public isDelete(after: string): boolean {
    return Number(after) === 0;
  }

  public getType(object_kind: string, after: string): string {
    return this.isDelete(after) ? '删除分支' : this.kindToTitleMap[object_kind] || object_kind;
  }
}

export const gitlabService = new GitlabService();
