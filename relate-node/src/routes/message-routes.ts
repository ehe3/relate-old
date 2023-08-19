import express from 'express';
import Sequelize from 'sequelize';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

import Message from '../models/message';
import Thread from '../models/thread';
import User from '../models/user';
import { SQL_DATE_FORMAT } from '../utilities/constants';
import { logger } from '../utilities/logger';

const router = express.Router();

// Make this concurrent correct and don't let posts on any daily question
router.post('/message', async (req, res) => {
  const userId = req.user as string;
  const { text, daily_question_id: dailyQuestionId } = req.body;
  try {
    const user = await User.findOne({ where: { id: userId } });
    if (!user) {
      logger.error('User not found.', { req });
      return res.status(404).send({ message: 'User not found.' });
    }
    if (!user.partnerId) {
      logger.error('User does not have a partner.', { req });
      return res.status(400).send({ message: 'User does not have a partner.' });
    }
    const thread = await Thread.findOne({
      where: {
        dailyQuestionId,
        [Sequelize.Op.or]: [
          {
            [Sequelize.Op.and]: [
              { partner1Id: user.id },
              { partner2Id: user.partnerId },
            ],
          },
          {
            [Sequelize.Op.and]: [
              { partner1Id: user.partnerId },
              { partner2Id: user.id },
            ],
          },
        ],
      },
    });
    let threadId = thread ? thread.id : undefined;
    if (!thread) {
      threadId = uuidv4();
      const newThread = Thread.build({
        dailyQuestionId,
        id: threadId,
        partner1Id: user.id,
        partner2Id: user.partnerId,
      });
      await newThread.save();
    }
    if (!threadId) {
      logger.error('Thread id could not be created.', { req });
      return res
        .status(400)
        .send({ message: 'Thread id could not be created.' });
    }
    const currentTime = moment().utc().format(SQL_DATE_FORMAT);
    const messageId = uuidv4();
    const message = Message.build({
      createdAt: currentTime,
      id: messageId,
      senderId: user.id,
      text,
      threadId,
    });
    await message.save();
    logger.info('Message sent.', { req });
    res.status(200).send({ message: 'Message sent.' });
  } catch (err) {
    logger.error(err.stack, { req });
    res.status(500).send();
  }
});

export default router;
