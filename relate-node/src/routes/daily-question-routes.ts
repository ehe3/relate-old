import express from 'express';

import DailyQuestion from '../models/daily-questions';
import { logger } from '../utilities/logger';

const router = express.Router();

router.get('/daily-question', async (req, res) => {
  const { date } = req.query;
  try {
    const dailyQuestion = await DailyQuestion.findOne({
      where: { date: date as string },
    });
    if (!dailyQuestion) {
      logger.error('Daily question not found.', { req });
      return res.status(404).send({ message: 'Daily question not found.' });
    }
    logger.info('Daily question retreived.', { req });
    res.status(200).send({ question: dailyQuestion.question });
  } catch (err) {
    logger.error(err.stack, { req });
    res.status(500).send();
  }
});

export default router;
