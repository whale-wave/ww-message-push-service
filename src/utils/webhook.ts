interface ToFeiShuData {
  title: string;
  user_name: string;
  user_username: string;
  project: {
    name: string;
    url: string;
    branch: string;
  };
  commits: { id: string; url: string; message: string }[];
}

type Platform = "gitlab" | "gitee" | "github" | "unknown";

export function getFeiShuPostByTemplate(
  title: string,
  platform: Platform,
  project: {
    name: string;
    url: string;
    branch: string;
  },
  content: any[]
) {
  return {
    msg_type: "post",
    content: {
      post: {
        zh_cn: {
          title,
          content: [
            [
              {
                tag: "at",
                user_id: "all",
              },
            ],
            [
              {
                tag: "text",
                text: "平台: ",
              },
              {
                tag: "text",
                text: platform,
              },
            ],
            [
              {
                tag: "text",
                text: "仓库: ",
              },
              {
                tag: "a",
                text: project.name,
                href: project.url,
              },
            ],
            [
              {
                tag: "text",
                text: `分支: ${project.branch}`,
              },
            ],
            ...content,
          ],
        },
      },
    },
  };
}

export function toFeiShu(data: ToFeiShuData, platform = "unknown" as Platform) {
  const { title, user_name, user_username, project, commits } = data;
  const result = getFeiShuPostByTemplate(title, platform, project, [
    [
      {
        tag: "text",
        text: "操作人: ",
      },
      {
        tag: "text",
        text: `${user_name}(${user_username})`,
      },
    ],
    [
      {
        tag: "text",
        text: "提交信息:",
      },
    ],
  ]);

  commits.forEach((commit: any) => {
    result.content.post.zh_cn.content.push([
      {
        tag: "a",
        text: `${commit.id.slice(0, 6)} `,
        href: commit.url,
      },
      {
        tag: "text",
        text: commit.message,
      },
    ]);
  });
  return result;
}
