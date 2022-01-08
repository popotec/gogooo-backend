const resultCode = require('../message/resultCode');

const mdbConnMeet = require('../models/meeting');
const mdbConnUserMeeting = require('../models/user_meeting');

const mdbConn = require('../models/index.js');

// 모임생성
const createMeeting = async (req, res, next) => {
  const {
    organizerId,
    interestCategoryTpcd,
    interestIconId,
    meetingNm,
    date,
    numOfPeople,
    minEntryFee,
    maxEntryFee,
    description,
    locTitle,
    locAddr,
          longitude,
      latitude
  } = req.body;

  console.log('here1');
  console.log(longitude);
  console.log(latitude);

  let conn;
  try {
    conn = await mdbConn.startTransaction();

    // DB table에 insert
    // 모임 생성
    let result = await mdbConnMeet.insertMeeting(
      conn,
      organizerId,
      interestCategoryTpcd,
      interestIconId,
      meetingNm,
      date,
      numOfPeople,
      minEntryFee,
      maxEntryFee,
      description,
          locTitle,
      locAddr,
      longitude,
      latitude
    );

    //const resultLastId = await mdbConnMeet.getMeetingLastId();
    // DB transaction 동기화 보장 확인
    const resultLastId = await mdbConnMeet.getLastInsertMeetingId(conn);

    const meetingId = resultLastId[0]['MAX_MEET_ID'];
    //const meetingId = resultLastId[0]['LAST_MEET_ID'];
    console.log(`meetingMaxId : ${meetingId}`);

    // 모임참여 입력
    result = await mdbConnMeet.insertUserMeeting(conn, meetingId, organizerId);
    mdbConn.commitTransaction(conn);
    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '모임 생성 성공',
      },
    ]);
  } catch (error) {
    console.log('here rollback');
    mdbConn.rollbackTransaction(conn);
    return next(error);
  }
};

/*
const getMeetingIcons = async (req, res, next) => {
  // ToDo : Hazel.
  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  try {
    let rowsMeetings = await mdbConnMeet.getAllMeetingIcons();
    console.log(rowsMeetings);
    if (rowsMeetings.length < 1) {
      err.message = '모임 아이콘이 존재하지 않습니다.';
      return next(err);
    }
    console.log('모임 아이콘 조회 success');

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
*/

const getPartiesInMeet = async (req, res, next) => {
  const { meetingId } = req.params;

  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  try {
    let users = await mdbConnUserMeeting.getUsersInMeeting(meetingId);
    console.log(users);
    if (users.length < 1) {
      err.message = '모임에 참여자가 존재하지 않습니다.';
      return next(err);
    }
    console.log('모임 참가자 리스트');

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: users,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

const getMeetInfo = async (req, res, next) => {
  const meetingId = parseInt(req.params.meetingId, 10);

  console.log('here meetingId');
  console.log(meetingId);
  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  try {
    let rowsMeeting = await mdbConnMeet.getMeetingDetail(meetingId);
    console.log('here 123');
    console.log(rowsMeeting);

    if (rowsMeeting.length < 1) {
      err.message = '해당 모임 정보를 확인할 수 없습니다.';
      return next(err);
    }

    console.log('meetings 조회 success');
    //console.log(rowsMeeting.json);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        result: rowsMeeting,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

const getMeetingMaxId = async (req, res, next) => {
  ///meetings/maxId

  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  console.log('here max id query');
  try {
    let results = await mdbConnMeet.getMeetingMaxId(null);
    console.log('here test');
    console.log(results);
    if (results.length < 1) {
      return res.status(resultCode.SUCCESS).json([
        {
          messsage: '모임이 존재하지 않습니다.',
          results: [],
        },
      ]);
    }

    console.log('모임탭 조회 success');
    console.log('getTabMeetingListWithOrgYn() end');

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',

        results: results[0],
      },
    ]);
  } catch (err) {
    console.log('getMeetingMaxId() end with error');

    return next(err);
  }
};

module.exports = {
  createMeeting,
  getPartiesInMeet,
  getMeetInfo,
  getMeetingMaxId,
};
