import * as express from 'express';

import { isLoggedIn } from '../middlewares';

import { getAllProfileList, getAllProfileIcons } from '../../controller/profilesController.js';
//require('dotenv').config();
const router = express.Router();

router.get('/all', getAllProfileList);
router.get('/profile-icons', getAllProfileIcons);

export default router;
