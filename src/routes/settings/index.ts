import * as express from 'express';

import { isLoggedIn } from '../middlewares';

import {
  getAllSettingsList,
  getAllNoticeList,
  getNotice,
  getAllAccountManagementList,
} from '../../controller/settingsController.js';

//require('dotenv').config();
const router = express.Router();

router.get('/all', getAllSettingsList);
router.get('/notice/all', getAllNoticeList);
router.get('/notice/:noticeId', getNotice);
router.get('/account-mng/all', getAllAccountManagementList);

export default router;
