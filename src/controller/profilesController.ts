import * as express from 'express';

import * as resultCode from '../message/resultCode';
import * as mdbConnProfiles from '../models/profiles';

async function getAllProfileList(req: express.Request, res: express.Response, next: express.NextFunction) {
  const err = new Error('Error');

  try {
    const rowsProfiles = await mdbConnProfiles.getAllProfileList();
    if (rowsProfiles.length < 1) {
      err.message = '내역이 존재하지 않습니다.';
      return next(err);
    }

    console.log('Profiles 조회 success');
    console.log(rowsProfiles.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rowsProfiles,
      },
    ]);
  } catch (err) {
    res.status(resultCode.BADREQUEST);
    return next(err);
  }
}

async function getAllProfileIcons(req: express.Request, res: express.Response, next: express.NextFunction) {
  const err = new Error('Error');

  try {
    const rowsProfiles = await mdbConnProfiles.getAllProfileIcons();
    if (rowsProfiles.length < 1) {
      err.message = '내역이 존재하지 않습니다.';
      return next(err);
    }

    console.log('Profile 조회 success');
    console.log(rowsProfiles.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rowsProfiles,
      },
    ]);
  } catch (err) {
    res.status(resultCode.BADREQUEST);
    return next(err);
  }
}

export { getAllProfileList, getAllProfileIcons };
