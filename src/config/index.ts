import _ from "lodash";

let config = {
  webhooks: {
    feiShu: [],
  },
};

export const initConfig = async () => {
  try {
    // @ts-ignore
    const { default: c } = await import("./index.local");
    config = _.merge(config, c);
  } catch (e) {
    console.log("不合并 local 文件");
  }
};

export const getConfig = () => config;
