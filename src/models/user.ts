// DB 기본 설정
import { exeSingleStat, doStatement } from './index.js';

async function getJoinApplicant(email: string) {
  const params = [email];
  const sql = `SELECT A.EMAIL
          , A.APPLY_SEQ
          , A.PASSWORD
          , A.APPLICATION_DTTM
          , A.APPROVAL_DTTM
          , A.TOKEN_KEY
          , A.ALT_TPCD
          , A.LAST_MODFR_NO
          , A.LAST_MODF_DTTM
        FROM 
        (  SELECT A.EMAIL
            , A.APPLY_SEQ
            , A.PASSWORD
            , A.APPLICATION_DTTM
            , A.APPROVAL_DTTM
            , A.TOKEN_KEY
            , A.ALT_TPCD
            , A.LAST_MODFR_NO
            , A.LAST_MODF_DTTM
              , @rownum := @rownum+1 AS RNUM
          FROM JOIN_APPLICANT A, (SELECT @rownum :=0) AS R
          WHERE A.EMAIL = ?
          ORDER BY A.APPLY_SEQ DESC
          ) A
        WHERE RNUM=1`;

  return await exeSingleStat(sql, params);
}

// 로그인시, 비밀번호를 포함하여 정보 대조시 사용
async function getUserInfoAllByEmail(email: string) {
  const params = [email];

  const result = await exeSingleStat(
    `SELECT  A.ID AS USER_ID
        , A.EMAIL
        , A.PASSWORD
        , IFNULL(A.NAME,'') AS USER_NM
        , A.SIGN_UP_DTTM
        , A.LAST_LOGIN_DTTM
        , A.WITHDRAWAL_DTTM
        , A.PROFILE_ICON_ID
        , IFNULL(C.IMG_FILE_NM,'') AS PROFILE_IMG_PATH
        , IFNULL(A.STAR_CODE,'') AS STAR_CODE
        , A.COMPANY_ID
        , IFNULL(D.HASH_TAGS, '') AS HASH_TAGS
        , A.GRAVITY_VALUE  /* 그래비티값 */ 
        , IFNULL(A.SEX,'') AS SEX
        , A.ALT_TPCD
        , A.LAST_MODFR_NO
        , A.LAST_MODF_DTTM
        FROM USER AS A
              LEFT OUTER JOIN  
                  (SELECT USER_ID
                        , GROUP_CONCAT('#', T.VALUE SEPARATOR ' ') AS HASH_TAGS
                  FROM USER_INTEREST D, CODE T
                  WHERE D.ALT_TPCD <> '3'
                  AND T.ALT_TPCD <>'3'
                  AND D.INTEREST_ID = T.CODE_TPCD
                  AND T.CODE_ID ='INTEREST_TPCD'                                        
                      GROUP BY D.USER_ID 
                  ) D
                 ON  D.USER_ID = A.ID
             LEFT OUTER JOIN                                               
               PROFILE_ICON AS C
             ON C.ID = A.PROFILE_ICON_ID AND C.ALT_TPCD <>'3'
        WHERE A.EMAIL=?
        AND A.ALT_TPCD!='3'`,
    params
  );
  return result;
}
//getUserInfoByName

async function getUserInfoByName(name: string) {
  const params = [name];

  const result = await exeSingleStat(
    `SELECT A.ID 
      FROM USER A
      WHERE A.NAME = ?
      AND A.ALT_TPCD <>'3'`,
    params
  );
  return result;
}

async function getUserById(id: string) {
  const params = [id];
  // 패스워드 빼고
  const result = await exeSingleStat(
    `SELECT  A.ID AS USER_ID
                                        , A.EMAIL
                                        , IFNULL(A.NAME,'') AS USER_NM
                                        , A.SIGN_UP_DTTM
                                        , A.LAST_LOGIN_DTTM
                                        , A.WITHDRAWAL_DTTM
                                        , A.PROFILE_ICON_ID
                                        , IFNULL(C.IMG_FILE_NM,'') AS PROFILE_IMG_PATH
                                        , IFNULL(A.STAR_CODE,'') AS STAR_CODE
                                        , A.COMPANY_ID
                                        , IFNULL(D.HASH_TAGS, '') AS HASH_TAGS
                                        , A.GRAVITY_VALUE  /* 그래비티값 */ 
                                        , IFNULL(A.SEX,'') AS SEX
                                        , A.ALT_TPCD
                                        , A.LAST_MODFR_NO
                                        , A.LAST_MODF_DTTM
                                        FROM USER AS A
                                              LEFT OUTER JOIN  
                                                  (SELECT USER_ID
                                                        , GROUP_CONCAT('#', T.VALUE SEPARATOR ' ') AS HASH_TAGS
                                                  FROM USER_INTEREST D, CODE T
                                                  WHERE D.ALT_TPCD <> '3'
                                                  AND T.ALT_TPCD <>'3'
                                                  AND D.INTEREST_ID = T.CODE_TPCD
                                                  AND T.CODE_ID ='INTEREST_TPCD'                                        
                                                      GROUP BY D.USER_ID 
                                                  ) D
                                                 ON A.ID = D.USER_ID
                                              LEFT OUTER JOIN                                               
                                                PROFILE_ICON AS C
                                              ON C.ID = A.PROFILE_ICON_ID AND C.ALT_TPCD <>'3'
                                        WHERE A.ID=?
                                        AND A.ALT_TPCD!='3'`,
    params
  );
  return result;
}

async function insertUser(email: string, password: string) {
  const params = [email, password];
  const sql = `INSERT INTO USER(EMAIL,PASSWORD) VALUES(?,?)`;
  const result = await exeSingleStat(sql, params);
  return result;
}
// 사용자 비밀번호 조회
async function getUserPassword(userId: string) {
  const params = [userId];
  const sql = `SELECT PASSWORD
             FROM   USER
             WHERE  ID = ? `;
  const result = await exeSingleStat(sql, params);
  return result;
}
// 사용자 비밀번호 변경
async function updateUserPassword(userId: string, newPassword: string) {
  const params = [newPassword, userId, userId];
  const sql = `UPDATE USER
             SET    PASSWORD       = ?
                  , ALT_TPCD       = '2' 
                  , LAST_MODFR_NO  = ?
                  , LAST_MODF_DTTM = SYSDATE()                  
             WHERE  ID             = ? `;
  const result = await exeSingleStat(sql, params);
  return result;
}

async function insertJoinApplicant(email: string, applySeq: number, token_key: string) {
  const params = [email, applySeq, token_key];
  const sql = `INSERT INTO JOIN_APPLICANT(EMAIL,APPLY_SEQ,TOKEN_KEY) VALUES(?,?,?)`;
  const result = await exeSingleStat(sql, params);
  return result;
}

async function updateJoinApplicant(email: string, applySeq: number) {
  const params = [email, applySeq];
  const sql = `UPDATE JOIN_APPLICANT
                             SET APPROVAL_DTTM=CURRENT_TIMESTAMP
                                 , ALT_TPCD = '2'
                             WHERE EMAIL=?
                             AND APPLY_SEQ=?`;
  const result = await exeSingleStat(sql, params);
  return result;
}

async function deleteJoinApplicant(email: string, applySeq: number) {
  const params = [email, applySeq];
  const sql = `UPDATE JOIN_APPLICANT
                             SET ALT_TPCD='3'
                             WHERE EMAIL=?
                             AND APPLY_SEQ=?`;
  const result = await exeSingleStat(sql, params);
  return result;
}

async function updateUserProfile(conn: any, userId: string, profileIconId: string, name: string, sex: string) {
  const params = [profileIconId, name, sex, userId];
  const sql = `UPDATE USER
      SET PROFILE_ICON_ID=?,
        NAME=?,
        SEX=?
      WHERE ID=?`;

  let result;

  if (conn == null) {
    result = await exeSingleStat(sql, params);
  } else {
    result = await doStatement(conn, sql, params);
  }

  return result;
}

export {
  getJoinApplicant,
  getUserById,
  getUserInfoAllByEmail,
  getUserInfoByName,
  insertUser,
  getUserPassword,
  updateUserPassword,
  insertJoinApplicant,
  updateJoinApplicant,
  deleteJoinApplicant,
  updateUserProfile,
};
