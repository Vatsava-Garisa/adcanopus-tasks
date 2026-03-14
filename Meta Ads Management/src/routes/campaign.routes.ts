
import express from 'express';

import { authenticateJwt } from '../middlewares/auth.middleware.js';
import * as campaignController from '../controllers/campaign.controller.js';

export const campaignRouter = express.Router();

campaignRouter.get('/', authenticateJwt, campaignController.getCampaign);

campaignRouter.get('/:campaignId', authenticateJwt, campaignController.getCampaign);

campaignRouter.post('/create', authenticateJwt, campaignController.createCampaign);

campaignRouter.patch('/edit', authenticateJwt, campaignController.editCampaign);

campaignRouter.delete('/:campaignId', authenticateJwt, campaignController.deleteCampaign);
