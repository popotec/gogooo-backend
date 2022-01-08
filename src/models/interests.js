const { exeSingleStat,
  doStatement} = require('./index.js');


async function getAllInterestList() {

   var params = [];
  let sql = `SELECT CODE_TPCD AS INTEREST_CATEGORY_ID /* 관심분야구분코드 */
                    , VALUE     AS INTEREST_CATEGORY_NM /* 관심분야구분코드명 */
                FROM  CODE  
                WHERE CODE_ID = 'INTEREST_TPCD' 
                AND   ALT_TPCD <> '3'
                ORDER BY CODE_ID 
                      , CODE_TPCD`;
  let result = await exeSingleStat(
    sql,
    params
  );
  return result;
}

async function getAllInterestIcons() {

   var params = [];
  let sql = `SELECT ID AS INTEREST_ICON_ID
                  , B.VALUE AS INTEREST_NM
                  , A.INTEREST_TPCD 
                  , A.INTEREST_SEQ   
                  , CASE WHEN A.IMG_FILE_NM IS NULL THEN 'icon_etc_01.png' 
                          ELSE A.IMG_FILE_NM 
                    END     AS INTEREST_IMG_FILE_NM 
              FROM   INTEREST_ICON A
                    , CODE B
              WHERE  B.CODE_ID = 'INTEREST_TPCD' 
              AND    A.INTEREST_TPCD = B.CODE_TPCD 
              AND    A.ALT_TPCD <> '3'
              AND    B.ALT_TPCD <> '3'
              ORDER BY A.INTEREST_TPCD 
                      , A.INTEREST_SEQ`;
  let result = await exeSingleStat(
    sql,
    params
  );
  return result;
}

module.exports = {
  getAllInterestList,
  getAllInterestIcons,
};
