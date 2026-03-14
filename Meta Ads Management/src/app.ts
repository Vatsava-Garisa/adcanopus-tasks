
import cors from 'cors';
import helmet from 'helmet';
import express, { type NextFunction, type Request, type Response } from 'express';

import { mainRouter } from './routes/router.js';

export const app = express();

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded());

/**
 * Base route
 */
app.use('/api', mainRouter);

/**
 * Invalid routes handler
 */
app.use((req, res, _) => {
    return res.status(404).json({
        status: "Fail",
        message: `Can't find ${req.method}: ${req.originalUrl} on the server`
    });
});

/**
 * Global error handler
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(`${req.method}: ${req.originalUrl} - Unhandled Error: `, error);
    return res.status(500).json({
        status: "Fail",
        message: "Something went wrong, please try after sometime"
    });
});
