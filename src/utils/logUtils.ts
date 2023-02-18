import fs from "fs";
import log4js from "log4js";
import path from "path";

export class LogUtils {
  private readonly logger: log4js.Log4js;
  public all: log4js.Logger;
  public debug: log4js.Logger;
  public access: log4js.Logger;
  public error: log4js.Logger;
  public daily: log4js.Logger;

  constructor(logPath: string) {
    this.logger = log4js;
    this.logger.configure({
      appenders: {
        console: { type: "console" },
        all: {
          type: "file",
          filename: path.join(logPath, "all.log"),
        },
        debug: {
          type: "file",
          filename: path.join(logPath, "debug.log"),
        },
        access: {
          type: "dateFile",
          filename: path.join(logPath, "access", "access.log"),
          pattern: "yyyy-MM-dd",
          alwaysIncludePattern: true,
          keepFileExt: true,
        },
        error: {
          type: "dateFile",
          filename: path.join(logPath, "error", "error.log"),
          pattern: "yyyy-MM-dd",
          alwaysIncludePattern: true,
          keepFileExt: true,
        },
        daily: {
          type: "dateFile",
          filename: path.join(logPath, "daily", "daily.log"),
          pattern: "yyyy-MM-dd",
          alwaysIncludePattern: true,
          keepFileExt: true,
        },
      },
      categories: {
        default: {
          appenders: ["console", "all"],
          level: "all",
        },
        daily: {
          appenders: ["console", "daily"],
          level: "all",
        },
        debug: {
          appenders: ["console", "debug"],
          level: "debug",
        },
        access: {
          appenders: ["console", "access"],
          level: "all",
        },
        error: {
          appenders: ["console", "error"],
          level: "all",
        },
      },
    });

    this.all = this.logger.getLogger();
    this.access = this.logger.getLogger("access");
    this.daily = this.logger.getLogger("daily");
    this.error = this.logger.getLogger("error");
    this.debug = this.logger.getLogger("debug");
  }
}

const LOG_DIR_PATH = path.resolve(process.cwd(), "logs");

if (!fs.existsSync(LOG_DIR_PATH)) {
  fs.mkdirSync(LOG_DIR_PATH);
}
const logUtils = new LogUtils(LOG_DIR_PATH);

export { logUtils };
