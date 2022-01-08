import * as mdbConn from '../models/user';
import * as passport from 'passport';
import { NextFunction } from 'express-serve-static-core';
import * as express from 'express';

const isLoggedIn = passport.authenticate('jwt', {
  session: false,
  // failureFlash: true,
});

async function isUniqueEmail(req: express.Request, res: express.Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;

    const rowsUser = await mdbConn.getUserInfoAllByEmail(email);
    if (rowsUser.length > 0) {
      // 이미 가입한 회원
      next('이미 가입한 회원입니다.');
    } else {
      next();
    }
  } catch (error) {
    return next(error);
  }
}

export {
  isLoggedIn,
  isUniqueEmail,
  //, isUniqueName
};
