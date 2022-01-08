import * as resultCode from '../message/resultCode';
import * as mdbConn from '../models/settings';
import * as express from 'express';
import { NextFunction } from 'connect';
import { SettingRepository } from '../repository/SettingRepository';
import { getCustomRepository } from 'typeorm';

/* 세팅탭 리스트 조회 */
const getAllSettingsList = async (req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    const settingRepository = getCustomRepository(SettingRepository);
    const rows = await settingRepository.findAll();
    console.log(rows);

    if (!rows || rows.length < 1) {
      const err = new Error('Error');
      res.status(resultCode.BADREQUEST);
      err.message = '내역이 존재하지 않습니다.';
      return next(err);
    }

    console.log('Settings 리스트 조회 success');
    console.log(rows.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rows,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

/* 공지사항 리스트 조회 */
const getAllNoticeList = async (req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    const rows = await mdbConn.getAllNoticeList();
    if (rows.length < 1) {
      const err = new Error('Error');
      res.status(resultCode.BADREQUEST);
      err.message = '내역이 존재하지 않습니다.';
      return next(err);
    }

    console.log('공지사항 리스트 조회 success');
    console.log(rows.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rows,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

/* 공지사항 상세내역 조회 */
const getNotice = async (req: express.Request, res: express.Response, next: NextFunction) => {
  const noticeId = parseInt(req.params.noticeId, 10);
  console.log(`noticeId : ${noticeId}`);

  try {
    const rows = await mdbConn.getNotice(noticeId);
    if (rows.length < 1) {
      const err = new Error('Error');
      res.status(resultCode.BADREQUEST);
      err.message = '내역이 존재하지 않습니다.';
      return next(err);
    }

    console.log('공지사항 상세내역 조회 success');
    console.log(rows.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rows,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

/* 설정탭 > 계정관리 리스트 조회 */
const getAllAccountManagementList = async (req: express.Request, res: express.Response, next: NextFunction) => {
  const err = new Error('Error');
  try {
    const rows = await mdbConn.getAllAccountManagementList();
    if (rows.length < 1) {
      const err = new Error('Error');
      res.status(resultCode.BADREQUEST);
      err.message = '내역이 존재하지 않습니다.';
      return next(err);
    }

    console.log('계정관리 리스트 조회 success');
    console.log(rows.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rows,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

export { getAllSettingsList, getAllNoticeList, getNotice, getAllAccountManagementList };
