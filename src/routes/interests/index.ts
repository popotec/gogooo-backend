import * as express from 'express';

import * as resultCode from '../../message/resultCode';

import { isLoggedIn } from '../middlewares';

import { getAllInterestList, getAllInterestIcons } from '../../controller/interestsController';

const router = express.Router();
//require('dotenv').config();

router.get('/all', getAllInterestList);
router.get('/interest-icons', getAllInterestIcons);

export default router;
