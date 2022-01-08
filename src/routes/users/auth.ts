// TO-DO : 하나의 오퍼레이션에 대해 연쇄 DB 데이터 변경이 일어날 경우 트랜젝션 제어
import * as express from 'express';

import { isLoggedIn, isUniqueEmail } from '../middlewares';

import {
  postLogin,
  postRefresh,
  doLogout,
  checkDupEmail,
  apprAuthApplicant,
  applyJoin,
  setPassword,
  getPasswordSetPage,
  testInsert,
  checkDupName,
  updateUserPassword,
} from '../../controller/userAuthController';

const router = express.Router();

router.post('/check-dup/email', checkDupEmail);
router.post('/check-dup/name', checkDupName);

router.get('/password-set', getPasswordSetPage);

router.post('/password-set', setPassword);

// [앱] 비밀번호 변경
router.post('/password-change', updateUserPassword);

/*
ㅇ 기능 정의 : 회원가입 신청에 대한 처리
ㅇ 내용 : 앱에서 회원가입신청을 한 경우, 이메일 중복 확인 후 가입신청.
      - USER 테이블에서 이메일 확인(신청중인 이메일 계정에 대해선 체크하지 않음)
*/
router.post('/applyJoin', isUniqueEmail, applyJoin);

//WEB으로 인증메일링크 클릭시, 서버 처리로직
router.get('/auth-applicant', apprAuthApplicant);

// router.post('/password-confirmation', isUniqueEmail, async (req, res) => {});

//login with jwt
router.post('/login', postLogin);

router.post('/refresh', postRefresh);

router.get('/logout', isLoggedIn, doLogout);

//////////////////////////////////////////////////////////////////////////
// router.post('/pushTest', pushTest);

// router.get('/pushTest2', isLoggedIn);

router.post('/testInsert', testInsert);

export default router;
