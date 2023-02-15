import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import { initConfig, getConfig } from "./config";
import logMiddleware from "./middleware/logMiddleware";
import { logUtils } from "./utils";

!(async () => {
  await initConfig();

  const app = express();
  const port = 1234;

  app.use(bodyParser());
  app.use(logMiddleware);

  app.post("/", async (req, res) => {
    const { object_kind, user_name, user_username, project, commits } =
      req.body;
    const gitlabResult = {
      msg_type: "post",
      content: {
        post: {
          zh_cn: {
            title: object_kind,
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
                  text: "gitlab",
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
                  href: project.web_url,
                },
              ],
              [
                {
                  tag: "text",
                  text: `分支: ${project.default_branch}`,
                },
              ],
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
            ],
          },
        },
      },
    };
    commits.forEach((commit: any) => {
      gitlabResult.content.post.zh_cn.content.push([
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
    for (const url of getConfig().webhooks.feiShu) {
      const { data } = await axios.post(url, gitlabResult);
      logUtils.daily.info("fei shu result", data);
    }
    res.send("success");
  });

  app.listen(port, () => {
    logUtils.all.info(`Service started successfully http://localhost:${port}`);
  });
})();
