import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import passport from 'passport';

import authenticationRoutes from './routes/authentication-routes';
import dailyQuestionRoutes from './routes/daily-question-routes';
import messageRoutes from './routes/message-routes';
import inviteRoutes from './routes/invite-routes';
import userRoutes from './routes/user-routes';

import { logger, morganMiddleware } from './utilities/logger';
import { configurePassport } from './config/passport';
import { PORT } from './config/env';

configurePassport();

const app = express();
app.use(express.json());
app.use(morganMiddleware);
app.use(cors());

app.use(authenticationRoutes);

app.use(passport.authenticate('jwt', { session: false }));

app.use(dailyQuestionRoutes);
app.use(messageRoutes);
app.use(inviteRoutes);
app.use(userRoutes);

const port = PORT === undefined ? 8080 : parseInt(PORT, 10);

app.listen(port, () => {
  logger.info(`Server is listening on port ${port}.`);
});
