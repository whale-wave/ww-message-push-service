import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import { initConfig, getConfig } from "./config";
import logMiddleware from "./middleware/logMiddleware";
import { getFeiShuPostByTemplate, logUtils, toFeiShu } from "./utils";

!(async () => {
  await initConfig();

  const app = express();

  app.use(bodyParser());
  app.use(logMiddleware);

  app.get("/", (req, res) => {
    res.send("hello! I am Avan.");
  });

  app.post("/webhook/github", async (req, res) => {
    const { head_commit, commits, repository, hook_id } = req.body;

    let result: any = null;

    const project = {
      name: repository.name,
      url: repository.html_url,
      branch: repository.default_branch,
    };

    if (hook_id && repository) {
      result = getFeiShuPostByTemplate("update", "gitlab", project, [
        [
          {
            tag: "text",
            text: "webhook update",
          },
        ],
      ]);
    } else if (head_commit && repository && commits) {
      result = toFeiShu(
        {
          title: "push",
          project,
          user_name: head_commit.author.name,
          user_username: head_commit.author.username,
          commits,
        },
        "github"
      );
    } else {
      logUtils.daily.info("github no support type", req.body);
      return res.send("no support");
    }

    for (const url of getConfig().webhooks.feiShu) {
      const { data } = await axios.post(url, result);
      logUtils.daily.info("github to fei shu result", data);
    }
    res.send("ok");
  });

  const gitlabHook = async (req: any, res: any) => {
    const { object_kind, ref, user_name, user_username, project, commits } =
      req.body;
    const kindToTitle = {
      push: "推送commit",
      tag_push: "推送标签",
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
      "gitlab"
    );
    for (const url of getConfig().webhooks.feiShu) {
      const { data } = await axios.post(url, result);
      logUtils.daily.info("gitlab to fei shu result", data);
    }
    res.send("success");
  };

  app.post("/", gitlabHook);
  app.post("/webhook/gitlab", gitlabHook);

  app.listen(getConfig().port, () => {
    logUtils.all.info(
      `Service started successfully http://localhost:${getConfig().port}`
    );
  });
})();
