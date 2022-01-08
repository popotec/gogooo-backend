const { concatLimit } = require('async');
const resultCode = require('../message/resultCode');
const mdbConnUsrMet = require('../models/user_meeting');

/* 모임참여 인원조회 */
const getUsersInMeetingList = async (req, res, next) => {
  //req.params.lastMeetingNum
  console.log('getUserMeetingList() start');
  console.log(req.params);

  const { userId, meetingId } = req.params;
  //const userId = req.params.userId; // for test

  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  try {
    let rowsUserMeetings = await mdbConnUsrMet.getUserMeetingList(
      userId,
      meetingId
    );

    console.log(rowsUserMeetings);
    if (rowsUserMeetings.length < 1) {
      return res.status(resultCode.SUCCESS).json([
        {
          messsage: '참여인원이 존재하지 않습니다.',
          results: [],
        },
      ]);
    }

    console.log('모임참여인원 조회 success');
    console.log('getUserMeetingList() end');

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rowsUserMeetings,
      },
    ]);
  } catch (err) {
    console.log('getUserMeetingList() end with error');

    return next(err);
  }
};

// [내설정] - 예정모임
const getUserPreMeetingList = async (req, res, next) => {
  const { userId, lastIdx } = req.params;
  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  console.log('here insided');
  try {
    // 두번째 파라미터 [ 1: 예정모임, 2:지난모임 ]
    console.log('here pre meeting');
    let rowsMeetings = await mdbConnUsrMet.getUserMeetingPreOrPostList(
      userId,
      1,
      lastIdx
    );
    if (rowsMeetings.length < 1) {
      //err.message = '예정 모임이 존재하지 않습니다.';
      //return next(err);
      return res.status(resultCode.SUCCESS).json([
        {
          messsage: '예정 모임이 존재하지 않습니다.',
          results: [],
        },
      ]);
    }

    console.log('meetings 조회 success');
    // console.log(rowsMeetings.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rowsMeetings,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

// [내설정] - 지난모임
const getUserPostMeetingList = async (req, res, next) => {
  const { userId, lastIdx } = req.params;

  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  try {
    console.log('here post meeting');
    // 두번째 파라미터 [ 1: 예정모임, 2:지난모임 ]
    let rowsMeetings = await mdbConnUsrMet.getUserMeetingPreOrPostList(
      userId,
      2,
      lastIdx
    );
    if (rowsMeetings.length < 1) {
      //   err.message = '지난 모임이 존재하지 않습니다.';
      //  return next(err);
      return res.status(resultCode.SUCCESS).json([
        {
          messsage: '지난 모임이 존재하지 않습니다.',
          results: [],
        },
      ]);
    }

    console.log('meetings 조회 success');
    // console.log(rowsMeetings.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rowsMeetings,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

// [내설정] - 관심모임
const getUserLikeMeetingList = async (req, res, next) => {
  const { userId, lastIdx } = req.params;

  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  try {
    console.log('here post meeting');
    let rowsMeetings = await mdbConnUsrMet.getUserLikeMeetingList(
      userId,
      lastIdx
    );
    if (rowsMeetings.length < 1) {
      //   err.message = '지난 모임이 존재하지 않습니다.';
      //  return next(err);
      return res.status(resultCode.SUCCESS).json([
        {
          messsage: '관심 모임이 존재하지 않습니다.',
          results: [],
        },
      ]);
    }

    console.log('meetings 조회 success');
    // console.log(rowsMeetings.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rowsMeetings,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

/* 모임탭 조회  */
const getUserMeetingScreenList = async (req, res, next) => {
  //req.params.lastMeetingNum
  console.log('getTabMeetingListWithOrgYn() start');
  //console.log(req.params);

  const { userId, maxMeetId, lastIdx } = req.params;
  //const userId = req.params.userId; // for test

  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  try {
    let rowsMeetings = await mdbConnUsrMet.getUserMeetingScreenList(
      userId,
      maxMeetId,
      lastIdx
    );
    // console.log('here test');
    // console.log(rowsMeetings);
    if (rowsMeetings.length < 1) {
      return res.status(resultCode.SUCCESS).json([
        {
          messsage: '현재 참석 가능한 모임이 존재하지 않습니다.',
          results: [],
        },
      ]);
    }

    console.log('모임탭 조회 success');
    console.log('getTabMeetingListWithOrgYn() end');

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: rowsMeetings,
      },
    ]);
  } catch (err) {
    console.log('getTabMeetingListWithOrgYn() end with error');

    return next(err);
  }
};



// 모임참여하기
const joinMeeting = async (req, res, next) => {
  // console.log(req);

  const { meetingId, userId } = req.body;

  try {
    // DB table에 insert
    let result = await mdbConnMeet.insertUserMeeting(null, meetingId, userId);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '모임참여하기 성공',
      },
    ]);
  } catch (error) {
    return next(error);
  }
};

// 모임참여취소하기
const leaveMeeting = async (req, res, next) => {
  // console.log(req);

  const { userId, meetingId } = req.params;

  try {
    // DB table에서 삭제
    let result = await mdbConnUsrMet.deleteUserMeeting(meetingId, userId);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '모임참여취소하기 성공',
      },
    ]);
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getUserMeetingScreenList,
  getUsersInMeetingList,
  getUserPreMeetingList,
  getUserPostMeetingList,
  getUserLikeMeetingList,
  joinMeeting,
  leaveMeeting
};
