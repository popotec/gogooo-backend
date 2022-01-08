// DB 기본 설정
const { exeSingleStat } = require('./index.js');
// 모임탭 리스트 조회
async function getUserMeetingScreenList(userId, maxMeetId,lastIdx) {
  // var params = [userId, userId, userId, lastMeetingNum, lastMeetingNum];

  var params = [userId, userId, userId,maxMeetId, lastIdx, lastIdx];

  let result = await exeSingleStat(
                            `SELECT * 
                                FROM (
                                  	SELECT 
	                                   	ROW_NUMBER() OVER (ORDER BY A.LAST_MODF_DTTM DESC) AS ROWNUM
                                          , A.ID AS MEETING_ID
                                          , A.INTEREST_CATEGORY_TPCD
                                          , E.VALUE AS INTEREST_NM 
                                          , IFNULL((SELECT  IMG_FILE_NM
                                                    FROM    INTEREST_ICON
                                                    WHERE   ID = A.INTEREST_ICON_ID
                                                    ), 'icon_etc_01.png') AS INTEREST_IMG_FILE_NM
                                          , IFNULL(C.HASH_TAGS, '') AS HASH_TAGS
                                          , A.MEETING_NM      AS MEETING_TITLE
                                          , IFNULL(A.LOCATION_TITLE,'') AS LOCATION_TITLE
                                          , IFNULL(A.LOCATION_ADDRESS,'') AS LOCATION_ADDRESS
                                          , IFNULL(A.LONGITUDE,'') AS LONGITUDE
                                          , IFNULL(A.LATITUDE,'') AS LATITUDE
                                          , IFNULL(B.CURRENT_USER_NUM, 0) AS NUM_OF_PEOPLE
                                          , A.MAX_USER_NUM 
                                          , DATE_FORMAT(A.START_DTTM, '%Y-%m-%d %H:%i:%s') AS MEETING_START_DTTM
                                          , REPLACE(REPLACE(DATE_FORMAT(A.START_DTTM, '%Y.%m.%d %p %h:%i'), 'AM' , '오전'), 'PM', '오후')  AS MEETING_DATE
                                          , IFNULL(A.DESCRIPTION, '')    AS DESCRIPTION
                                          , A.ORGANIZER_ID
                                          , D.NAME            AS ORGANIZER_NM
                                          , CASE WHEN ORGANIZER_ID = ? THEN 'Y' 
                                                 ELSE 'N' 
                                            END AS ORGANIZER_YN
                                          , IFNULL((SELECT 'Y'
                                                    FROM   USER_MEETING 
                                                    WHERE  MEETING_ID = A.ID 
                                                    AND    USER_ID = ?
                                                    ), 'N')  AS JOIN_YN
                                          , IFNULL((SELECT 'Y' 
                                                    FROM USER_LIKE_MEETING 
                                                    WHERE USER_ID = ?
                                                    AND MEETING_ID = A.ID), 'N') AS LIKE_YN
                                      FROM  MEETING A 
                                            LEFT OUTER JOIN 
                                                  (SELECT MEETING_ID 
                                                        , COUNT(BB.USER_ID) AS CURRENT_USER_NUM
                                                  FROM   USER_MEETING BB
                                                  WHERE  BB.ALT_TPCD <> '3'
                                                  GROUP BY MEETING_ID 
                                                  ) B 
                                            ON    A.ID = B.MEETING_ID 
                                            LEFT OUTER JOIN  
                                                  (SELECT MEETING_ID
                                                        , GROUP_CONCAT('#', TAG_NM SEPARATOR ' ') AS HASH_TAGS
                                                  FROM   MEETING_HASHTAG
                                                  WHERE  ALT_TPCD <> '3'
                                                  GROUP BY MEETING_ID 
                                                  ) C
                                            ON    A.ID = C.MEETING_ID
                                            JOIN  USER D
                                            ON    A.ORGANIZER_ID = D.ID 
                                            JOIN  (SELECT CODE_TPCD
                                                        , VALUE
                                                  FROM    CODE  
                                                  WHERE   CODE_ID = 'INTEREST_TPCD'
                                                  AND     ALT_TPCD <> '3'
                                                  ) E
                                            ON    E.CODE_TPCD = A.INTEREST_CATEGORY_TPCD
                                      WHERE A.ALT_TPCD <> '3'
                                        AND A.ID<=?
                                      ) A 
                                      WHERE A.ROWNUM >=? AND A.ROWNUM < ? + 7 -- 테스트용으로 7개 
                                      `,
    params
  );
  console.log('getUserMeetingScreenList query');
  return result;
}

/* 모임참여 인원조회 */
async function getUserMeetingList(userId, meetingId) {

  var params = [userId,userId,meetingId];
  let sql = `SELECT * 
            FROM ( SELECT @rownum := @rownum+1 AS RNUM
                        , B.MEETING_ID   /* 모임 ID */
                        , A.MEETING_NM   /* 모임명 */
                        , A.ORGANIZER_ID
                        , B.SIGN_UP_DTTM /* 모임참여일시 */
                        , B.USER_ID AS USER_ID /* 모임참석사용자ID */
                        , C.NAME    AS USER_NM /* 모임참석사용자명 */
                        , C.PROFILE_ICON_ID
                        , (SELECT IMG_FILE_NM
                              FROM   PROFILE_ICON
                              WHERE  ID = C.PROFILE_ICON_ID) AS PROFILE_IMG_PATH
                        , C.GRAVITY_VALUE  /* 그래비티값 */
                        , IFNULL(C.SEX,'') AS SEX
                        , CASE WHEN A.ORGANIZER_ID = B.USER_ID THEN 'Y'
                                    ELSE 'N' END AS ORGANIZER_YN  /* 모임장 여부 */
                        , IFNULL(( SELECT 'Y' 
                                    FROM   USER_LIKE_STAR_USER 
                                    WHERE  USER_ID = ?
                                    AND    STAR_USER_ID = B.USER_ID 
                                    AND    ALT_TPCD <> '3'
                                    ), 'N')  AS LIKE_YN   /* 좋아하는 사용자 */
                        , IFNULL(( SELECT 'Y' 
                                    FROM   USER_DISLIKE_STAR_USER 
                                    WHERE  USER_ID = ?
                                    AND    STAR_USER_ID = B.USER_ID 
                                    AND    ALT_TPCD <> '3' 
                                    ), 'N')  AS DISLIKE_YN /* 싫어하는 사용자 */  
                  FROM    MEETING  A
                  JOIN    USER_MEETING  B
                  ON      A.ID = B.MEETING_ID 
                  JOIN    USER  C 
                  ON      B.USER_ID = C.ID 
                  JOIN (SELECT @rownum :=0) AS R  
                  WHERE   A.ALT_TPCD <> '3'
                  AND     A.ID = ?
                  ORDER BY  CASE WHEN A.ORGANIZER_ID = B.USER_ID THEN 'Y' ELSE 'N' END DESC /* 모임장 여부 */
                              , B.SIGN_UP_DTTM 
                              , C.GRAVITY_VALUE 
                              , B.USER_ID 
                              ) A`;
  let result = await exeSingleStat(
    sql,
    params
  );
  return result;
}

// [내공간] - 예정모임, 지난모임 조회
async function getUserMeetingPreOrPostList(userId, timeStdCd,lastIdx) {
  var params = [userId, userId, userId, timeStdCd, timeStdCd,lastIdx,lastIdx];

  let result = await exeSingleStat(
                          `SELECT * 
                                FROM (
                                  	SELECT 
	                                   	ROW_NUMBER() OVER (ORDER BY A.START_DTTM DESC) AS ROWNUM
                                  , A.ID AS MEETING_ID
                                  , A.INTEREST_CATEGORY_TPCD
                                  , E.VALUE AS INTEREST_NM 
                                  , IFNULL((SELECT  IMG_FILE_NM
                                            FROM    INTEREST_ICON
                                            WHERE   ID = A.INTEREST_ICON_ID
                                            ), 'icon_etc_01.png') AS INTEREST_IMG_FILE_NM
                                  , IFNULL(C.HASH_TAGS, '') AS HASH_TAGS
                                  , A.MEETING_NM      AS MEETING_TITLE
                                  , IFNULL(A.LOCATION_TITLE,'') AS LOCATION_TITLE
                                  , IFNULL(A.LOCATION_ADDRESS,'') AS LOCATION_ADDRESS
                                  , IFNULL(A.LONGITUDE,'') AS LONGITUDE
                                  , IFNULL(A.LATITUDE,'') AS LATITUDE
                                  , IFNULL(B.CURRENT_USER_NUM, 0) AS NUM_OF_PEOPLE
                                  , A.MAX_USER_NUM 
                                  , DATE_FORMAT(A.START_DTTM, '%Y-%m-%d %H:%i:%s') AS MEETING_START_DTTM
                                  , REPLACE(REPLACE(DATE_FORMAT(A.START_DTTM, '%Y.%m.%d %p %h:%i'), 'AM' , '오전'), 'PM', '오후')  AS MEETING_DATE
                                  , IFNULL(A.DESCRIPTION, '')    AS DESCRIPTION
                                  , CASE WHEN A.ORGANIZER_ID =? THEN 'Y' 
                                        ELSE 'N' 
                                    END AS ORGANIZER_YN
                                  , IFNULL((SELECT 'Y' 
                                    FROM USER_LIKE_MEETING 
                                    WHERE USER_ID = ?
                                    AND MEETING_ID = A.ID), 'N') AS LIKE_YN
                            FROM USER_MEETING T, MEETING A
                                      LEFT OUTER JOIN 
                                            (SELECT MEETING_ID 
                                                  , COUNT(BB.USER_ID) AS CURRENT_USER_NUM
                                            FROM   USER_MEETING BB
                                            WHERE  BB.ALT_TPCD <> '3'
                                            GROUP BY MEETING_ID 
                                            ) B 
                                      ON    A.ID = B.MEETING_ID 
                                      LEFT OUTER JOIN  
                                            (SELECT MEETING_ID
                                                  , GROUP_CONCAT('#', TAG_NM SEPARATOR ' ') AS HASH_TAGS
                                            FROM   MEETING_HASHTAG
                                            WHERE  ALT_TPCD <> '3'
                                            GROUP BY MEETING_ID 
                                            ) C
                                      ON    A.ID = C.MEETING_ID
                                      JOIN  (SELECT CODE_TPCD
                                                  , VALUE
                                            FROM    CODE  
                                            WHERE   CODE_ID = 'INTEREST_TPCD'
                                            AND     ALT_TPCD <> '3'
                                            ) E
                                      ON    E.CODE_TPCD = A.INTEREST_CATEGORY_TPCD
                                      JOIN (SELECT @rownum :=0) AS R  
                            WHERE T.USER_ID = ?
                            AND T.MEETING_ID =A.ID  
                            AND T.ALT_TPCD <> '3'
                            AND A.ALT_TPCD <> '3'
                            AND '1' = CASE WHEN ? = 1 AND IFNULL(A.START_DTTM,current_timestamp()) > current_timestamp() THEN '1'
                                    WHEN ? = 2 AND IFNULL(A.START_DTTM,current_timestamp()) <= current_timestamp() THEN '1'
                                    ELSE '2' END
                         ) A 
                          WHERE A.ROWNUM >=? AND A.ROWNUM < ? + 25`,
    params
  );
  console.log('getUserMeetingPreOrPostList query');
  return result;
}
//getUserLikeMeetingList

// [내공간] - 관심모임 조회
async function getUserLikeMeetingList(userId,lastIdx) {
  var params = [userId, userId, userId,lastIdx,lastIdx];

  let result = await exeSingleStat(
                     `SELECT * 
						                FROM (
							                SELECT ROW_NUMBER() OVER (ORDER BY T.LAST_MODF_DTTM DESC) AS ROWNUM
                                  , A.ID AS MEETING_ID
                                  , A.INTEREST_CATEGORY_TPCD
                                  , E.VALUE AS INTEREST_NM 
                                  , IFNULL((SELECT  IMG_FILE_NM
                                            FROM    INTEREST_ICON
                                            WHERE   ID = A.INTEREST_ICON_ID
                                            ), 'icon_etc_01.png') AS INTEREST_IMG_FILE_NM
                                  , IFNULL(C.HASH_TAGS, '') AS HASH_TAGS
                                  , A.MEETING_NM      AS MEETING_TITLE
                                  , IFNULL(A.LOCATION_TITLE,'') AS LOCATION_TITLE
                                  , IFNULL(A.LOCATION_ADDRESS,'') AS LOCATION_ADDRESS
                                  , IFNULL(A.LONGITUDE,'') AS LONGITUDE
                                  , IFNULL(A.LATITUDE,'') AS LATITUDE
                                  , IFNULL(B.CURRENT_USER_NUM, 0) AS NUM_OF_PEOPLE
                                  , A.MAX_USER_NUM 
                                  , DATE_FORMAT(A.START_DTTM, '%Y-%m-%d %H:%i:%s') AS MEETING_START_DTTM
                                  , REPLACE(REPLACE(DATE_FORMAT(A.START_DTTM, '%Y.%m.%d %p %h:%i'), 'AM' , '오전'), 'PM', '오후')  AS MEETING_DATE
                                  , IFNULL(A.DESCRIPTION, '')    AS DESCRIPTION
                                  , CASE WHEN A.ORGANIZER_ID = ? THEN 'Y' 
                                        ELSE 'N' 
                                    END AS ORGANIZER_YN
                                  , IFNULL((SELECT 'Y' 
                                    FROM USER_LIKE_MEETING 
                                    WHERE USER_ID = ?
                                    AND MEETING_ID = A.ID), 'N') AS LIKE_YN
                            FROM USER_LIKE_MEETING T, MEETING A
                                      LEFT OUTER JOIN 
                                            (SELECT MEETING_ID 
                                                  , COUNT(BB.USER_ID) AS CURRENT_USER_NUM
                                            FROM   USER_MEETING BB
                                            WHERE  BB.ALT_TPCD <> '3'
                                            GROUP BY MEETING_ID 
                                            ) B 
                                      ON    A.ID = B.MEETING_ID 
                                      LEFT OUTER JOIN  
                                            (SELECT MEETING_ID
                                                  , GROUP_CONCAT('#', TAG_NM SEPARATOR ' ') AS HASH_TAGS
                                            FROM   MEETING_HASHTAG
                                            WHERE  ALT_TPCD <> '3'
                                            GROUP BY MEETING_ID 
                                            ) C
                                      ON    A.ID = C.MEETING_ID
                                      JOIN  (SELECT CODE_TPCD
                                                  , VALUE
                                            FROM    CODE  
                                            WHERE   CODE_ID = 'INTEREST_TPCD'
                                            AND     ALT_TPCD <> '3'
                                            ) E
                                      ON    E.CODE_TPCD = A.INTEREST_CATEGORY_TPCD
                                   --   JOIN (SELECT @rownum :=0) AS R  
                            WHERE T.USER_ID =?
                            AND T.MEETING_ID =A.ID  
                            AND T.ALT_TPCD <> '3'
                            AND A.ALT_TPCD <> '3'
                            ) A
                            WHERE A.ROWNUM >=? AND A.ROWNUM < ? + 25`,
    params
  );
  console.log('getUserLikeMeetingList query');

  return result;
}

// [내공간] - 참여한 모임 조회
async function getUserPartiScore(userId) {
  var params = [userId];

  let result = await exeSingleStat(
                     `SELECT
                          T.USER_ID
                              , SUM(CASE WHEN IFNULL(A.START_DTTM,current_timestamp()) > current_timestamp() THEN 1
                                    ELSE 0 END) AS NUM_OF_PRE
                              , SUM(CASE WHEN IFNULL(A.START_DTTM,current_timestamp()) <= current_timestamp() THEN 1
                                    ELSE 0 END) AS NUM_OF_POST
                              , SUM(CASE WHEN A.ORGANIZER_ID =T.USER_ID THEN 1 
                                    ELSE 0 END) AS NUM_OF_OWN
                              
                            FROM USER_MEETING T, MEETING A
                            WHERE T.USER_ID = ?
                            AND T.MEETING_ID =A.ID  
                            AND T.ALT_TPCD <> '3'
                            AND A.ALT_TPCD <> '3'
	                        GROUP BY T.USER_ID`,
    params
  );
  console.log('getUserPartiScore query');

  return result;
}

// [내공간] - 관심 모임 기록 조회
async function getUserLikeScore(userId) {
  var params = [userId];

  let result = await exeSingleStat(
                     `SELECT 
                            COUNT(*) AS NUM_OF_LIKE       
                        FROM USER_LIKE_MEETING K
                        WHERE K.USER_ID= ?
                        AND K.ALT_TPCD<>'3'	`,
    params
  );
  console.log('getUserLikeScore query');

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

module.exports = {
  getUserMeetingScreenList,
  getUserMeetingList,
  getUserMeetingPreOrPostList,
  getUserLikeMeetingList,
  getUserPartiScore,
      getUserLikeScore,
      deleteUserMeeting
};
