const { exeSingleStat,
  doStatement} = require('./index.js');

async function getAllProfileList() {
  var params = [];
  let sql = `SELECT CODE_TPCD AS PROFILE_ID /* 프로필구분코드 */
                                    , VALUE     AS PROFILE_NM /* 프로필구분코드명 */
                                FROM  CODE  
                                WHERE CODE_ID = 'PROFILE_TPCD' 
                                AND   ALT_TPCD <> '3'
                                ORDER BY CODE_ID 
                                       , CODE_TPCD`;
  let result = await exeSingleStat(
    sql,
    params
  );
  return result;
  
}

async function getAllProfileIcons() {

  var params = [];
  let sql = `SELECT ID AS PROFILE_ICON_ID
                  , A.PROFILE_TPCD 
                  , B.VALUE         AS PROFILE_NM
                  , A.PROFILE_SEQ   
                  , A.IMG_FILE_NM   AS PROFILE_IMG_FILE_NM 
              FROM   PROFILE_ICON A
                    , CODE B
              WHERE  B.CODE_ID = 'PROFILE_TPCD' 
              AND    A.PROFILE_TPCD = B.CODE_TPCD 
              AND    A.ALT_TPCD <> '3'
              AND    B.ALT_TPCD <> '3'
              ORDER BY A.PROFILE_TPCD 
                      , A.PROFILE_SEQ`;
  let result = await exeSingleStat(
    sql,
    params
  );
  return result;
}

module.exports = {
  getAllProfileList,
  getAllProfileIcons,
};
