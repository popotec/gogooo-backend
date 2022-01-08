const { concatLimit } = require('async');
const resultCode = require('../message/resultCode');
const mdbConnUser = require('../models/user');
const mdbConnUserMeet = require('../models/user_meeting');
const mdbConnUserInst = require('../models/user_interest');

const mdbConn = require('../models/index.js');

const getMyProfile = async (req, res, next) => {
  //console.log(req.body);
  const user = req.user;
  //const user = req.user;
  console.log('here');
  console.log(user);

  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  try {
    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        user: user,
      },
    ]);
  } catch (err) {
    return next(err);
  }
};

/* 사용자 기록 카운트  */
const getUserScore = async (req, res, next) => {
  //req.params.lastMeetingNum
  console.log('getUserScore() start');
  console.log(req.params);

  const { userId } = req.params;
  //const userId = req.params.userId; // for test

  const err = new Error('Error');
  err.status = resultCode.BADREQUEST;

  try {
    let rowsParti = await mdbConnUserMeet.getUserPartiScore(userId);

    let rowsLike = await mdbConnUserMeet.getUserLikeScore(userId);
    var result = {};
    console.log('here test');
    console.log(rowsParti);
    if (rowsParti.length < 1) {
      result['NUM_OF_PRE'] = 0;
      result['NUM_OF_POST'] = 0;
      result['NUM_OF_OWN'] = 0;
    } else {
      var partiScore = rowsParti[0];
      result['NUM_OF_PRE'] = partiScore['NUM_OF_PRE'];
      result['NUM_OF_POST'] = partiScore['NUM_OF_POST'];
      result['NUM_OF_OWN'] = partiScore['NUM_OF_OWN'];
    }

    if (rowsLike.length < 1) {
      result['NUM_OF_LIKE'] = 0;
    } else {
      var likeScore = rowsLike[0];
      result['NUM_OF_LIKE'] = likeScore['NUM_OF_LIKE'];
    }
    console.log('getUserScore() end');

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '조회에 성공하였습니다.',
        results: result,
      },
    ]);
  } catch (err) {
    console.log('getUserScore() end with error');

    return next(err);
  }
};

/* 트랜젝션 사용 방법
1) let conn = await mdbConn.startTransaction(); // db 연결 셋팅 및 트랜젝션 시작
2) 쿼리 수행 (내부적으로 doStatement 함수 사용. 연결객체 conn을 파라미터로 넘겨줌)
3) 성공유무에 따라서 commit 혹은 rollback으로 트랜젝션 종료
*/

// 사용자 프로필 만들기
const createMyProfile = async (req, res, next) => {
  console.log('here create start');
  const user = req.user;

  const bodyContents = req.body;

  let interests = bodyContents['interests'];

  //TODO : 쿼리 4개 짜기, meeting 테이블 auto-increment로 바꾸기
  let conn;
  try {
    conn = await mdbConn.startTransaction();
    // 1) user table에 update
    let sucRes = await mdbConnUser.updateUserProfile(
      conn,
      user['USER_ID'],
      bodyContents['PROFILE_ICON_ID'],
      bodyContents['NAME'],
      bodyContents['SEX']
    );

    // 2) user_interest 에 기존 내역 삭제(delete)
    sucRes = await mdbConnUserInst.deleteUserInterests(conn, user['USER_ID']);

    // 3) user_interest 에 insert
    for (let interest of interests) {
      // 배열 순차탐색. in 을 사용하면 index가 반환되고 of를 사용하면 값이 반환됨
      sucRes = await mdbConnUserInst.insertUserInterest(
        conn,
        user['USER_ID'],
        interest
      );
    }
    mdbConn.commitTransaction(conn);

    return res.status(resultCode.SUCCESS).json([
      {
        messsage: '프로필 만들기 성공',
      },
    ]);
  } catch (error) {
    mdbConn.rollbackTransaction(conn);
    console.log(error);
    return next(error);
  }
};

module.exports = {
  getMyProfile,
  getUserScore,
  createMyProfile,
};
