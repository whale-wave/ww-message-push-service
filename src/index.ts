import axios from "axios";
import express from "express";
import bodyParser from "body-parser";
import { initConfig, getConfig } from "./config";
import logMiddleware from "./middleware/logMiddleware";
import { logUtils, toFeiShu } from "./utils";

!(async () => {
  await initConfig();

  const app = express();
  const port = 1234;

  app.use(bodyParser());
  app.use(logMiddleware);

  app.get("/", (req, res) => {
    res.send("hello! I am Avan.");
  });

  app.post("/webhook/github", async (req, res) => {
    const { head_commit, commits, repository } = req.body;

    for (const url of getConfig().webhooks.feiShu) {
      const result = toFeiShu(
        {
          title: "push",
          user_name: head_commit.author.name,
          user_username: head_commit.author.username,
          project: {
            name: repository.name,
            url: repository.url,
            branch: repository.default_branch,
          },
          commits,
        },
        "github"
      );
      const { data } = await axios.post(url, result);
      logUtils.daily.info("github to fei shu result", data);
    }
    res.send("ok");
  });

  app.post("/", async (req, res) => {
    const { object_kind, user_name, user_username, project, commits } =
      req.body;
    const result = toFeiShu(
      {
        title: object_kind,
        user_name,
        user_username,
        project: {
          name: project.name,
          url: project.web_url,
          branch: project.default_branch,
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
  });

  app.listen(port, () => {
    logUtils.all.info(`Service started successfully http://localhost:${port}`);
  });
})();
