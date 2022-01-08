
// DB 기본 설정
const { exeSingleStat } = require('./index.js');

/* 설정탭 리스트 조회 */
async function getAllSettingsList() {
  let result = await exeSingleStat(
    `SELECT   A.ORDER_SEQ
            , A.VALUE AS SETTING_NM
            , (SELECT IMG_FILE_NM 
              FROM   LIST_LEADING_ICON
              WHERE  CODE_ID   =  A.CODE_ID 
              AND    CODE_TPCD = A.CODE_TPCD 
              ) AS SETTING_IMG_FILE_NM
    FROM   CODE  A
    WHERE  A.CODE_ID   = 'SETTING_TPCD'
    AND    A.ALT_TPCD <> '3'
    ORDER BY A.ORDER_SEQ  `
  );
  return result;
}

/* 설정탭 > 공지사항 리스트 조회 */
async function getAllNoticeList() {
  let result = await exeSingleStat(` SELECT  ID
                                          , TITLE
                                          , DATE_FORMAT(NOTICE_DATE, '%Y.%m.%d')   "DATE"
                                          , CASE DATE_FORMAT(NOTICE_DATE, '%p') WHEN 'AM' THEN '오전'
                                            ELSE '오후' END AS "AP"
                                          , DATE_FORMAT(NOTICE_DATE, '%l:%i')  "TIME"
                                    FROM   NOTICE 
                                    WHERE  ALT_TPCD <> '3'
                                    ORDER BY NOTICE_DATE DESC
                                           , ID DESC `);

  return result;
}

/* 설정탭 > 공지사항 > 공지사항 상세내역 조회 */
async function getNotice(noticeId) {
  var params = [noticeId];
  //  const { noticeId } = req.params;
  console.log(`noticeId : ${noticeId}`);
  console.log(`params : ${params}`);

  let result = await exeSingleStat(
    ` SELECT   ID
             , TITLE
             , CONTENTS
             , DATE_FORMAT(NOTICE_DATE, '%Y.%m.%d')   "DATE"
             , CASE DATE_FORMAT(NOTICE_DATE, '%p') WHEN 'AM' THEN '오전'
                    ELSE '오후' 
               END AS "AP"
             , DATE_FORMAT(NOTICE_DATE, '%l:%i')  "TIME"
        FROM   NOTICE 
        WHERE  ALT_TPCD <> '3'
        AND    ID = ?
        ORDER BY NOTICE_DATE DESC  `,
    params
  );
  console.log('getNotice() end ');
  return result;
}

/* 설정탭 > 계정관리 리스트 조회 */
async function getAllAccountManagementList() {
  let result = await exeSingleStat(
    ` SELECT    A.ORDER_SEQ
              , A.VALUE AS SETTING_NM
              , IFNULL((SELECT IMG_FILE_NM 
                        FROM   LIST_LEADING_ICON
                        WHERE  CODE_ID          = A.CODE_ID 
                        AND    CODE_TPCD        = A.CODE_TPCD 
                        AND    CODE_DETAIL_ID   = A.CODE_DETAIL_ID 
                        AND    CODE_DETAIL_TPCD = A.CODE_DETAIL_TPCD 
                        AND    ALT_TPCD         <> '3' 
                        ), '')  AS SETTING_IMG_FILE_NM
      FROM   CODE_DETAIL  A
      WHERE  A.CODE_ID        = 'SETTING_TPCD'
      AND    A.CODE_DETAIL_ID = 'SETTING_ACCOUNT_MANAGEMENT_TPCD'
      AND    A.ALT_TPCD       <> '3'
      ORDER BY A.ORDER_SEQ `
  );
  return result;
}

module.exports = {
  getAllSettingsList, // 설정탭 리스트 조회
  getAllNoticeList, // 설정탭 > 공지사항 리스트 조회
  getNotice, // 설정탭 > 공지사항 > 공지사항 상세내역 조회
  getAllAccountManagementList, // 설정탭 > 계정관리 리스트 조회
};
