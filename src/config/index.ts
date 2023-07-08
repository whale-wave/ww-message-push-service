import _ from 'lodash';
import config from './config';
import { merge } from '../utils';

let _config = config;

export const initConfig = async () => {
  try {
    // @ts-ignore
    const { default: c } = await import('./config.local');
    _config = merge(_config, c);
  } catch (e) {
    console.log('不合并 local 文件');
  }
};

export default _config;
