import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT || 1234,
  webhooks: {
    feiShu: [],
    dingDing: [],
  },
};
