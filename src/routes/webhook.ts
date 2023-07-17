import express from 'express';
import { webhookController } from '../controllers';

export const webhookRouter = express.Router();

webhookRouter.post('/gitlab', webhookController.gitlab);
webhookRouter.post('/github', webhookController.github);
webhookRouter.post('/codeup', webhookController.codeup);
