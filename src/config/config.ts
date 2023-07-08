import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 1234,
  telegram: {
    proxy: '',
    list: [
      // {
      //   token: '',
      //   chatIds: [''],
      // },
    ] as { token: string; chatIds: string[] }[],
  },
  webhooks: {
    feiShu: [],
    dingDing: [],
  },
};
