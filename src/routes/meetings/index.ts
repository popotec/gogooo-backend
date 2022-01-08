import * as express from 'express';
import { isLoggedIn } from '../middlewares';

import { createMeeting, getPartiesInMeet, getMeetInfo, getMeetingMaxId } from '../../controller/meetingController';
import { createNewChat, getChats } from '../../controller/chatController';

const router = express.Router();

router.get('/maxId', getMeetingMaxId);

router.get('/:meetingId/users', getPartiesInMeet);
// chat
//'/meetings/${meetingId}/chats?lastReadId=${lastMsgId}';
router.get('/:meetingId/chats', getChats);
router.post('/:meetingId/chats', isLoggedIn, createNewChat);

// 특정 모임 상세내역 조회
router.get('/:meetingId', getMeetInfo);

// 모임 생성
router.post('/', createMeeting);

export default router;
