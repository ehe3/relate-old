import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../config/db';

import Invite from '../models/invite';
import User from '../models/user';

import { InviteStatus } from '../utilities/constants';
import { logger } from '../utilities/logger';

const router = express.Router();

router.post('/accept_invite', async (req, res) => {
  const userId = req.user as string;
  const { invite_id: inviteId } = req.body;
  const t = await db.transaction();
  try {
    const invite = await Invite.findOne({ where: { id: inviteId } });
    if (!invite) {
      logger.error('Invite not found.', { req });
      return res.status(400).send({ message: 'Invite not found.' });
    }
    if (invite.status !== InviteStatus.SENT || invite.toId !== userId) {
      logger.error('Invalid invite status.', { req });
      return res.status(400).send({ message: 'Invalid invite status.' });
    }
    // Clear invites for both the inviter and invitee
    await Invite.update(
      { status: InviteStatus.REJECTED },
      {
        where: { toId: invite.toId, status: InviteStatus.SENT },
        transaction: t,
      }
    );
    await Invite.update(
      { status: InviteStatus.REJECTED },
      {
        where: { toId: invite.fromId, status: InviteStatus.SENT },
        transaction: t,
      }
    );
    await Invite.update(
      { status: InviteStatus.CANCELLED },
      {
        where: { fromId: invite.toId, status: InviteStatus.SENT },
        transaction: t,
      }
    );
    await Invite.update(
      { status: InviteStatus.CANCELLED },
      {
        where: { fromId: invite.fromId, status: InviteStatus.SENT },
        transaction: t,
      }
    );
    await invite.update({ status: InviteStatus.ACCEPTED }, { transaction: t });
    // Update partner id for both the inviter and invitee
    await User.update(
      { partnerId: invite.fromId },
      { where: { id: invite.toId }, transaction: t }
    );
    await User.update(
      { partnerId: invite.toId },
      { where: { id: invite.fromId }, transaction: t }
    );
    await t.commit();
    logger.info(
      `Invite accepted. ${invite.toId} and ${invite.fromId} have partnered up.`,
      { req }
    );
    res.status(200).send({ message: 'Invite accepted.' });
  } catch (err) {
    await t.rollback();
    logger.error(err.stack, { req });
    res.status(500).send();
  }
});

router.put('/invite', async (req, res) => {
  const { status, invite_id: inviteId } = req.body;
  try {
    const invite = await Invite.findOne({ where: { id: inviteId } });
    if (!invite) {
      logger.error('Invite not found.', { req });
      return res.status(400).send({ message: 'Invite not found.' });
    }
    if (
      status !== InviteStatus.CANCELLED &&
      status !== InviteStatus.REJECTED &&
      status !== InviteStatus.ACCEPTED
    ) {
      logger.error('Invalid invite status.', { req });
      return res.status(400).send({ message: 'Invalid invite status.' });
    }
    await invite.update({ status });
    logger.info(`Invite ${inviteId} updated to ${status}.`, { req });
    res.status(200).send();
  } catch (err) {
    logger.error(err.stack, { req });
    res.status(500).send();
  }
});

router.post('/invite', async (req, res) => {
  const userId = req.user as string;
  const { username } = req.body;
  if (!username) {
    logger.error('Username not provided.', { req });
    return res.status(400).send({ message: 'Username is required.' });
  }
  try {
    const userInfo = await User.findOne({
      where: { id: userId },
    });
    if (!userInfo || !userInfo.username || userInfo.username === username) {
      logger.error(`Tried to send invite to own username.`, { req });
      return res
        .status(400)
        .send({ message: 'Cannot send invite to yourself.' });
    }
    const outstandingInvite = await Invite.findOne({
      where: { fromId: userId, status: InviteStatus.SENT },
    });
    if (outstandingInvite) {
      logger.error('User already has an outstanding invite.', { req });
      return res
        .status(400)
        .send({ message: 'You already have an outstanding invite.' });
    }
    const toUser = await User.findOne({
      where: { username: username.toLowerCase() },
    });
    if (!toUser || !toUser.username) {
      logger.error('User does not exist.', { req });
      return res
        .status(400)
        .send({ message: `User ${username.toLowerCase()} does not exist.` });
    }
    const id = uuidv4();
    const invite = Invite.build({
      id,
      status: InviteStatus.SENT,
      fromId: userId,
      fromUsername: userInfo.username,
      toId: toUser.id,
      toUsername: toUser.username,
    });
    await invite.save();
    logger.info(`Invite sent to ${username.toLowerCase()}.`, { req });
    res.status(201).send();
  } catch (err) {
    logger.error(err.stack, { req });
    res.status(500).send();
  }
});

export default router;
