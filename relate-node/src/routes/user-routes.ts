import express from 'express';

import Invite from '../models/invite';
import User from '../models/user';

import db from '../config/db';
import { logger } from '../utilities/logger';
import { InviteStatus } from '../utilities/constants';

const router = express.Router();

router.post('/remove_partner', async (req, res) => {
  const userId = <string>req.user;
  const t = await db.transaction();
  try {
    const userInfo = await User.findOne({ where: { id: userId } });
    if (!userInfo) {
      logger.error('User not found.', { req });
      return res.status(400).send({ message: 'User not found.' });
    }
    if (!userInfo.partnerId) {
      logger.error('No partner found.', { req });
      return res.status(400).send({ message: 'No partner found.' });
    }
    const partnerInfo = await User.findOne({
      where: { id: userInfo.partnerId },
    });
    if (!partnerInfo) {
      logger.error('Partner not found.', { req });
      return res.status(400).send({ message: 'Partner not found.' });
    }
    await userInfo.update({ partnerId: null }, { transaction: t });
    await partnerInfo.update({ partnerId: null }, { transaction: t });
    await t.commit();
    // Potentially delete history here.
    logger.info(`${userInfo.partnerId} removed as partner.`, { req });
    return res.status(200).send({ message: 'Partner removed.' });
  } catch (err) {
    await t.rollback();
    logger.error(err.stack, { req });
    res.status(500).send();
  }
});

router.get('/user', async (req, res) => {
  const userId = <string>req.user;
  try {
    const user = await User.findOne({
      where: { id: userId },
      include: [
        User.associations.partner,
        {
          model: Invite,
          required: false,
          as: 'outstandingInvite',
          where: { status: InviteStatus.SENT },
        },
        {
          model: Invite,
          required: false,
          as: 'inboundInvites',
          where: { status: InviteStatus.SENT },
        },
      ],
    });
    if (!user) {
      return res.status(404).send();
    }
    logger.info('User information retreived.', { req });
    res.status(200).send({ user });
  } catch (err) {
    logger.error(err.stack, { req });
    res.status(500).send();
  }
});

router.put('/user', async (req, res) => {
  const userId = <string>req.user;
  const { name, username }: { name: string; username: string } = req.body;
  const t = await db.transaction();
  try {
    if (username) {
      const user = await User.findOne({
        where: { username: username.toLowerCase() },
      });
      if (user) {
        return res.status(400).send({
          message:
            'This username already exists. Please enter another username.',
        });
      }
    }
    await User.update(
      { name, username: username.toLowerCase() },
      { where: { id: userId }, transaction: t }
    );
    await t.commit();
    logger.info('Account updated.', { req });
    res.status(200).send({ name, username: username.toLowerCase() });
  } catch (err) {
    await t.rollback();
    logger.error(err.stack, { req });
    res.status(500).send();
  }
});

export default router;
