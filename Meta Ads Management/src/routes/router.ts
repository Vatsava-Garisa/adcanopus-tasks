
import express from 'express';

import { authRouter } from "./auth.routes.js";
import { campaignRouter } from "./campaign.routes.js";

export const mainRouter = express.Router();

mainRouter.use('/auth', authRouter);

mainRouter.use('/campaign', campaignRouter);
