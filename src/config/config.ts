import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 1234,
  schedule: {
    newset: {
      enable: false,
    },
  },
  telegram: {
    proxy: '',
    list: [
      // {
      //   token: '',
      //   chatGroups: [
      //     {
      //       chatId: '',
      //       replyToMessageId: 5,
      //     }
      //   ],
      // },
    ] as { token: string; chatGroups: { chatId: string; replyToMessageId?: number }[] }[],
  },
  webhooks: {
    feiShu: [],
    dingDing: [],
  },
};
