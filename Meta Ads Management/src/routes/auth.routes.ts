import express from 'express';

import * as authController from '../controllers/auth.controller.js';

export const authRouter = express.Router();

authRouter.post('/generateToken', authController.generateToken);
