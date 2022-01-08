// DB 기본 설정
const { exeSingleStat, doStatement } = require('./index.js');

// 피드 조회
async function getFeedList(feedTpcd,maxFeedId,lastIdx) {
  let params = [feedTpcd,feedTpcd,maxFeedId,lastIdx,lastIdx];
  let sql = `SELECT * 
            FROM (
                SELECT
                    F.USER_ID  AS WRITER_ID
                    , U.NAME 
                    , (SELECT IMG_FILE_NM
                        FROM   PROFILE_ICON
                        WHERE  ID = U.PROFILE_ICON_ID) AS PROFILE_IMG_PATH
                    , F.CONTENT AS CONTENT 
                    , IFNULL(F.IMAGE_URL,'') AS IMAGE_URL
                    , ROW_NUMBER() OVER (ORDER BY F.LAST_MODF_DTTM DESC) AS ROWNUM
                FROM FEED F, USER U
                WHERE F.ALT_TPCD <>'3'
                AND F.USER_ID =U.ID 
                AND (0=? OR F.FEED_TPCD = ?)
                AND F.ID<=?
                )A
            WHERE A.ROWNUM >=? AND A.ROWNUM < ? + 7 -- 테스트용으로 7개 
             `;

  let result = await exeSingleStat(sql, params);
  return result;
}

// 모임 입력
async function insertFeed(
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
  location
) {
  let params = [
    feedTpcd,
    content,
    interestIconId,
    meetingNm,
    date,
    numOfPeople,
    numOfPeople,
    minEntryFee,
    maxEntryFee,
    description,
    location,
    location,
    organizerId,
  ];
  let sql = `INSERT 
              INTO FEED 
              (
              FEED_TPCD
              , CONTENT
              , IMAGE_URL
              , USER_ID
              )
              VALUES
              (
                ?
              , ?
              , ?
              , ?
              )`;

  if (conn == null) {
    result = await exeSingleStat(sql, params);
  } else {
    result = await doStatement(conn, sql, params);
  }
  return result;
}

// 모임참여하기 입력
async function insertUserMeeting(conn, meetingId, userId) {
  var params = [meetingId, userId];
  let sql = `INSERT INTO  USER_MEETING
                            ( MEETING_ID
                            , USER_ID    
                            )
                            VALUES (
                                ?
                              , ?   
                                  )`;

  let result;
  if (conn == null) {
    result = await exeSingleStat(sql, params);
  } else {
    result = await doStatement(conn, sql, params);
  }
  return result;
}

// 모임참여하기 삭제
async function deleteUserMeeting(meetingId, userId) {
  var params = [meetingId, userId];
  let sql = `DELETE FROM USER_MEETING
                WHERE MEETING_ID =  ?
                AND   USER_ID    = ?`;
  let result = await exeSingleStat(sql, params);
  return result;
}
/*
async function getMeetingLastId(conn) {
  // connection 마다 동기화 보장하므로 별도 락은 필요없음.
  let params = [];

  let sql = `SELECT LAST_INSERT_ID() AS LAST_MEET_ID`;

  let result;

  if (conn == null) {
    result = await exeSingleStat(sql, params);
  } else {
    result = await doStatement(conn, sql, params);
  }
  return result;
}*/

async function getMeetingMaxId(conn) {
  var params = [];
  let sql = `SELECT  MAX(ID) AS MAX_MEET_ID
      FROM MEETING`;
  let result;

  if (conn == null) {
    result = await exeSingleStat(sql, params);
  } else {
    result = await doStatement(conn, sql, params);
  }
  return result;
}

module.exports = {
  getMeetingDetail,
  insertMeeting,
  insertUserMeeting,
  deleteUserMeeting,
  getMeetingMaxId,
  // getMeetingLastId,
};
