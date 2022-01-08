import * as express from 'express';

import { isLoggedIn } from '../middlewares';

import {
  getUserMeetingScreenList,
  getUsersInMeetingList,
  getUserPreMeetingList,
  getUserPostMeetingList,
  getUserLikeMeetingList,
  //getUserMeetingScreenPartList,
  joinMeeting,
  leaveMeeting,
} from '../../controller/userMeetingController';

import {
  getUserScore,
  //getUserMeetingScreenPartList,
} from '../../controller/userController';

const router = express.Router();

router.get('/:userId/records', getUserScore); // 사용자 기록 조회
router.get('/:userId/meetings/pre/:lastIdx', getUserPreMeetingList); // 지난모임 조회
router.get('/:userId/meetings/post/:lastIdx', getUserPostMeetingList); // 예정모임 조회
router.get('/:userId/meetings/like/:lastIdx', getUserLikeMeetingList); // 예정모임 조회
router.get('/:userId/meetings/:maxMeetId/:lastIdx', getUserMeetingScreenList); // 모임탭 조회
router.get('/:userId/meetings/:meetingId', getUsersInMeetingList); // 모임참여인원 조회

// 모임참여하기
router.post('/:userId/join/meetings/:meetingId', joinMeeting); // 모임 참여
router.delete('/:userId/leave/meetings/:meetingId', leaveMeeting); // 모임참여 취소

export default router;
