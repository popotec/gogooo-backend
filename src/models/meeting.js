// DB 기본 설정
const { exeSingleStat, doStatement } = require('./index.js');

// 모임 상세내역 조회
async function getMeetingDetail(meetingId) {
  let params = [meetingId];
  let sql = `SELECT  
              A.ID
            , A.ORGANIZER_ID
            , A.INTEREST_CATEGORY_TPCD
            , A.INTEREST_ICON_ID
            , A.MEETING_NM
            , A.START_DTTM
            , A.MIN_USER_NUM
            , A.MAX_USER_NUM
            , A.MIN_ENTRY_FEE
            , A.MAX_ENTRY_FEE
            , A.DESCRIPTION
            , IFNULL(A.LOCATION_TITLE,'') AS LOCATION_TITLE
            , IFNULL(A.LOCATION_ADDRESS,'') AS LOCATION_ADDRESS
            , IFNULL(A.LONGITUDE,'') AS LONGITUDE
            , IFNULL(A.LATITUDE,'') AS LATITUDE
            , A.PROS_TPCD
            , A.ALT_TPCD
            , A.LAST_MODFR_NO
            , A.LAST_MODF_DTTM 
              FROM  MEETING AS A
              WHERE ALT_TPCD <> '3'
              AND   A.ID = ?
             `;

  let result = await exeSingleStat(sql, params);
  return result;
}

// 특정 모임이후 n개 조회
/*
async function getMeetingsFromLastNum(lastMeetingNum, num) {

  
  let conn, rows;
  try {
    conn = await pool.getConnection();
    conn.query(`USE ${config.database}`);

    // rows = await conn.query(` SELECT *
    //                           FROM  (
    //                                 SELECT  A.*
    //                                       , @rownum := @rownum+1 AS RNUM
    //                                 FROM    gogooo_dev.MEETING A
    //                                     , (SELECT @rownum :=0) AS R
    //                                 WHERE A.ALT_TPCD <> '3'
    //                                 ORDER BY START_DTTM DESC
    //                                 ) B
    //                           WHERE  RNUM BETWEEN '${lastMeetingNum}' + 1 AND '${lastMeetingNum}' + '${num}' `);
  } catch (err) {
    console.err(err);
    throw err;
  } finally {
    if (conn) conn.end();
    return rows;
  }
}

// 최근 모임 내역 100개(전체) 조회
async function getAllMeetings() {
  let conn, rows;
  try {
    conn = await pool.getConnection();
    conn.query(`USE ${config.database}`);

    // rows = await conn.query(` SELECT *
    //                           FROM  (
    //                                 SELECT  A.*
    //                                       , @rownum := @rownum+1 AS RNUM
    //                                 FROM    gogooo_dev.MEETING A
    //                                     , (SELECT @rownum :=0) AS R
    //                                 WHERE A.ALT_TPCD <> '3'
    //                                 ORDER BY START_DTTM DESC
    //                                 ) B
    //                           WHERE  RNUM <= 100 `);
  } catch (err) {
    console.err(err);
    throw err;
  } finally {
    if (conn) conn.end();
    return rows;
  }
}

// 최근 모임 내역 100개(전체) 조회
async function getAllMeetingIcons() {
  let conn, rows;
  try {
    conn = await pool.getConnection();
    conn.query(`USE ${config.database}`);

    // rows = await conn.query(` SELECT  A.INTEREST_TPCD
    //                                 , B.VALUE
    //                             FROM    INTEREST A
    //                                 , CODE     B
    //                             WHERE   B.CODE_ID        = 'INTEREST_TPCD'
    //                             AND     A.INTEREST_TPCD  = B.CODE_TPCD
    //                             AND     A.ALT_TPCD      != '3'
    //                             AND     B.ALT_TPCD      != '3'
    //                             ORDER BY A.INTEREST_TPCD
    //                                 , B.VALUE
    //                                 , A.INTEREST_NM `);
  } catch (err) {
    console.err(err);
    throw err;
  } finally {
    if (conn) conn.end();
    return rows;
  }
}
*/
// 모임 입력
async function insertMeeting(
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
  latitude,
) {
  let params = [
    organizerId,
    interestCategoryTpcd,
    interestIconId,
    meetingNm,
    date,
    numOfPeople,
    numOfPeople,
    minEntryFee,
    maxEntryFee,
    description,
    locTitle,
    locAddr,
    longitude,
    latitude,
  organizerId
  ];

    console.log('here2');
  console.log(longitude);
  console.log(latitude);

  let sql = `INSERT INTO MEETING
    ( ORGANIZER_ID
    , INTEREST_CATEGORY_TPCD
    , INTEREST_ICON_ID
    , MEETING_NM
    , START_DTTM
    , MIN_USER_NUM
    , MAX_USER_NUM
    , MIN_ENTRY_FEE
    , MAX_ENTRY_FEE
    , DESCRIPTION
    , LOCATION_TITLE
    , LOCATION_ADDRESS
    , LONGITUDE
    , LATITUDE
    , PROS_TPCD
    , ALT_TPCD
    , LAST_MODFR_NO
    , LAST_MODF_DTTM
    )
    VALUES (
        ?
      , ?
      , ?
      , ?
      , ?
      , ?
      , ?
      , ?
      , ?
      , ?
      , ?
      , ?
      , ?
      , ?
      , '1'
      , '1'
      , ?
      , now()
       )`;

  
  console.log('here conn');
  console.log(conn);
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

async function getLastInsertMeetingId(conn) {
  var params = [];
  
  // LAST_INSERT_ID()를 connection 마다 관리하므로 동기화 보장 가능
  let sql='SELECT LAST_INSERT_ID() as MAX_MEET_ID;'
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
  getMeetingMaxId,
  getLastInsertMeetingId
  // getMeetingLastId,
};
