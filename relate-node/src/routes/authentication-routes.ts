import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

import db from '../config/db';
import User from '../models/user';
import {
  getRefreshToken,
  getToken,
  verifyAppleToken,
} from '../utilities/authentication';
import { logger } from '../utilities/logger';
import { REFRESH_TOKEN_SECRET } from '../config/env';
import { Token } from '../utilities/types';

const router = express.Router();

router.post('/refresh_token', async (req, res) => {
  const { refresh_token } = req.body;
  if (!refresh_token) {
    logger.error(`Could not generate refresh token.`, { req });
    return res.status(401).send();
  }
  try {
    const payload = jwt.verify(refresh_token, REFRESH_TOKEN_SECRET);
    const { id } = payload as Token;
    const user = await User.findOne({ where: { id } });
    if (!user || user.refreshToken !== refresh_token) {
      logger.error('Could not generate refresh token.', { req });
      return res.status(401).send();
    }
    const token = getToken(id);
    logger.info(`Token refreshed for ${user.email}.`, { req });
    res.status(200).send({ token });
  } catch (err) {
    logger.error(err.stack, { req });
    res.status(500).send();
  }
});

router.post('/sign_in_manually', async (req, res) => {
  const { email } = req.body;
  const t = await db.transaction();
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      const id = uuidv4();
      const token = getToken(id);
      const refreshToken = getRefreshToken(id);
      const buildParams = {
        accountType: 'manual',
        email,
        id,
        refreshToken,
      };
      const newUser = User.build(buildParams);
      await newUser.save({ transaction: t });
      await t.commit();
      logger.info('Account created.', { req });
      return res.status(201).send({ token, refreshToken, id, email });
    }
    const token = getToken(user.id);
    const refreshToken = user.refreshToken || getRefreshToken(user.id);
    await User.update({ refreshToken }, { where: { id: user.id } });
    logger.info(`${user.id} logged in successfully.`, { req });
    res.status(200).send({ token, refreshToken });
  } catch (err) {
    logger.error(err.stack, { req });
    res.status(500).send();
  }
});

router.post('/sign_in_with_apple', async (req, res) => {
  const { identity_token: identityToken }: { identity_token: string } =
    req.body;
  const t = await db.transaction();
  try {
    const result = await verifyAppleToken(identityToken);
    const user = await User.findOne({
      where: { appleSub: result.sub },
    });

    // Register for an account.
    if (!user) {
      const id = uuidv4();
      const token = getToken(id);
      const refreshToken = getRefreshToken(id);
      const buildParams = {
        accountType: 'apple',
        appleSub: result.sub,
        email: result.email,
        id,
        refreshToken,
      };
      const newUser = User.build(buildParams);
      await newUser.save({ transaction: t });
      await t.commit();
      logger.info('Account created.', { req });
      return res
        .status(201)
        .send({ token, refreshToken, id, email: result.email });
    }
    //  Perform log in.
    else {
      const token = getToken(user.id);
      const refreshToken = user.refreshToken || getRefreshToken(user.id);
      await User.update({ refreshToken }, { where: { id: user.id } });
      logger.info(`${user.id} logged in successfully.`, { req });
      res.status(200).send({ token, refreshToken });
    }
    res.status(200).send();
  } catch (err) {
    await t.rollback();
    logger.error(err.stack, { req });
    res.status(500).send();
  }
});

export default router;
