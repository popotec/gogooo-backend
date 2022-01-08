import * as express from 'express';

import { isLoggedIn } from '../middlewares';

import { getMyProfile, createMyProfile } from '../../controller/userController';

const router = express.Router();

router.get('/', isLoggedIn, getMyProfile); // 사용자정보 조회
router.post('/', isLoggedIn, createMyProfile); // 사용자 프로필 생성

export default router;
