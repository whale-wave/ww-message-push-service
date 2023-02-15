import _ from 'lodash';
import config from './config';

let _config = config;

export const initConfig = async () => {
  try {
    // @ts-ignore
    const {default: c} = await import('./config.local');
    _config = _.merge(_config, c);
  } catch (e) {
    console.log('不合并 local 文件');
  }
};

export const getConfig = () => _config;
